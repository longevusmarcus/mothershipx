import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withRateLimit, RateLimitPresets } from "../_shared/rateLimit.ts";
import { searchTikTokSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendSignal {
  source: string;
  metric: string;
  value: string;
  change: number;
  icon?: string;
}

interface TikTokVideo {
  id: string;
  text: string;
  createTime: number;
  authorMeta?: { name?: string; nickName?: string; verified?: boolean };
  hashtags?: Array<{ name: string }>;
  diggCount?: number;
  shareCount?: number;
  playCount?: number;
  commentCount?: number;
  collectCount?: number;
  webVideoUrl?: string;
}

interface AnalyzedProblem {
  title: string;
  subtitle: string;
  category: string;
  sentiment: "exploding" | "rising" | "stable" | "declining";
  painPoints: string[];
  hiddenInsight: {
    surfaceAsk: string;
    realProblem: string;
    hiddenSignal: string;
  };
  demandVelocity: number;
  competitionGap: number;
  opportunityScore: number;
}

interface ApifyRunResponse {
  data: { id: string; defaultDatasetId: string; status: string };
}

interface CachedResult {
  id: string;
  niche: string;
  results: any[];
  videos_analyzed: number;
  queries_used: string[];
  created_at: string;
  expires_at: string;
}

// Cache duration in hours
const CACHE_DURATION_HOURS = 24;

// Niche to search query mapping
const NICHE_QUERIES: Record<string, string[]> = {
  "mental-health": ["mental health struggle", "anxiety help me", "burnout symptoms", "therapy alternative", "can't sleep anxiety"],
  "weight-fitness": ["weight loss frustrated", "gym intimidating", "diet not working", "fitness beginner help", "can't lose weight"],
  "skin-beauty": ["skincare not working", "adult acne frustrating", "anti aging when start", "skin routine overwhelming", "sunscreen white cast"],
  "gut-health": ["bloating every day", "gut health confused", "food sensitivity help", "digestive issues", "probiotics don't work"],
  "productivity": ["can't focus anymore", "productivity burnout", "todo list overwhelming", "morning routine fake", "work from home struggle"],
  "career": ["job hunting depressing", "career change scared", "salary negotiation help", "work life balance impossible", "boss toxic"],
  "connections": ["social anxiety crippling", "making friends adult", "dating apps exhausting", "lonely despite friends", "confidence low"],
  "business": ["startup struggle", "business idea validation", "founder burnout", "side hustle tips", "revenue growth stuck", "marketing not working", "startup fail stories"],
};

const NICHE_CATEGORIES: Record<string, string> = {
  "mental-health": "Mental Health",
  "weight-fitness": "Weight & Fitness",
  "skin-beauty": "Skin & Beauty",
  "gut-health": "Gut Health",
  "productivity": "Productivity",
  "career": "Career",
  "connections": "Social & Relationships",
  "business": "Business",
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function generateSources(totalViews: number, avgEngagement: number): TrendSignal[] {
  return [
    { source: "tiktok", metric: "Total Views", value: formatNumber(totalViews), change: Math.round(avgEngagement * 50), icon: "📱" },
    { source: "tiktok", metric: "Avg Engagement", value: `${(avgEngagement * 100).toFixed(1)}%`, change: Math.round(avgEngagement * 100), icon: "💬" },
    { source: "google_trends", metric: "Search Interest", value: `${Math.min(99, Math.round(avgEngagement * 500))}/100`, change: Math.round(avgEngagement * 30), icon: "📈" },
  ];
}

async function getCachedResults(supabase: any, niche: string): Promise<CachedResult | null> {
  const { data, error } = await supabase
    .from('search_cache')
    .select('*')
    .eq('niche', niche)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Cache lookup error:', error);
    return null;
  }

  return data;
}

async function setCachedResults(
  supabase: any, 
  niche: string, 
  results: any[], 
  videosAnalyzed: number,
  queriesUsed: string[]
): Promise<void> {
  // Delete old cache entries for this niche
  await supabase
    .from('search_cache')
    .delete()
    .eq('niche', niche);

  // Insert new cache entry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

  const { error } = await supabase
    .from('search_cache')
    .insert({
      niche,
      results,
      videos_analyzed: videosAnalyzed,
      queries_used: queriesUsed,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error('Cache write error:', error);
  } else {
    console.log(`Cached ${results.length} results for niche: ${niche}`);
  }
}

async function fetchTikTokData(query: string, apiToken: string): Promise<TikTokVideo[]> {
  console.log(`Fetching TikTok data for query: ${query}`);
  
  const actorId = "clockworks~free-tiktok-scraper";
  const startUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiToken}`;
  
  const startResponse = await fetch(startUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      searchQueries: [query],
      maxProfilesPerQuery: 1,
      resultsPerPage: 15,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSlideshowImages: false,
    }),
  });

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    console.error("Apify start error:", errorText);
    throw new Error(`Failed to start Apify actor: ${startResponse.status}`);
  }

  const runData: ApifyRunResponse = await startResponse.json();
  const runId = runData.data.id;
  const datasetId = runData.data.defaultDatasetId;
  
  console.log(`Apify run started: ${runId}, dataset: ${datasetId}`);

  // Wait for completion (poll every 3 seconds, max 90 seconds)
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const statusUrl = `https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${apiToken}`;
    const statusResponse = await fetch(statusUrl);
    
    if (!statusResponse.ok) {
      attempts++;
      continue;
    }
    
    const statusData = await statusResponse.json();
    const status = statusData.data.status;
    
    console.log(`Run status: ${status}`);
    
    if (status === "SUCCEEDED") {
      const resultsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiToken}`;
      const resultsResponse = await fetch(resultsUrl);
      
      if (!resultsResponse.ok) throw new Error("Failed to fetch results");
      
      const results: TikTokVideo[] = await resultsResponse.json();
      console.log(`Fetched ${results.length} videos`);
      return results;
    }
    
    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify run ${status}`);
    }
    
    attempts++;
  }
  
  throw new Error("Apify run timed out");
}

async function analyzeWithAI(videos: TikTokVideo[], niche: string, category: string, apiKey: string): Promise<AnalyzedProblem[]> {
  console.log(`Analyzing ${videos.length} videos with AI for niche: ${niche}`);
  
  // Prepare video summaries for AI analysis
  const videoSummaries = videos
    .filter(v => v.text && v.playCount)
    .slice(0, 15)
    .map(v => ({
      text: v.text.substring(0, 500),
      views: v.playCount || 0,
      likes: v.diggCount || 0,
      shares: v.shareCount || 0,
      saves: v.collectCount || 0,
      comments: v.commentCount || 0,
      hashtags: v.hashtags?.map(h => h.name).slice(0, 5) || [],
    }));

  if (videoSummaries.length === 0) {
    console.log("No valid videos to analyze");
    return [];
  }

  const totalViews = videoSummaries.reduce((sum, v) => sum + v.views, 0);
  const avgEngagement = videoSummaries.reduce((sum, v) => {
    const engagement = (v.likes + v.shares + v.saves + v.comments) / Math.max(v.views, 1);
    return sum + engagement;
  }, 0) / videoSummaries.length;

  const systemPrompt = `You are a market research AI that analyzes TikTok content to identify real user pain points and market opportunities.

Your task is to analyze TikTok video content from the "${category}" niche and identify 3-5 distinct PROBLEMS or PAIN POINTS that people are expressing, struggling with, or seeking help for.

For each problem, you must identify:
1. A clear, compelling problem title (what people are struggling with)
2. A subtitle that adds context about the trend
3. 3 specific pain points people express
4. A hidden insight with:
   - surfaceAsk: What people literally say they want
   - realProblem: The deeper issue behind it
   - hiddenSignal: The market opportunity this reveals
5. demandVelocity (1-100): How urgently people need this solved
6. competitionGap (1-100): How underserved this problem is
7. sentiment: "exploding" (viral/urgent), "rising" (growing), "stable" (consistent), or "declining"

Focus on:
- Complaints and frustrations
- Questions people ask
- Problems people share
- Gaps in existing solutions
- Emotional pain and struggles

DO NOT just describe what videos are about. Extract the UNDERLYING PROBLEMS people face.`;

  const userPrompt = `Analyze these TikTok videos from the "${category}" niche and extract 3-5 distinct market problems:

${JSON.stringify(videoSummaries, null, 2)}

Total engagement across videos:
- Total views: ${formatNumber(totalViews)}
- Average engagement rate: ${(avgEngagement * 100).toFixed(2)}%

Return the problems using the suggest_problems tool.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "suggest_problems",
            description: "Return analyzed market problems from TikTok data",
            parameters: {
              type: "object",
              properties: {
                problems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Clear problem statement (max 60 chars)" },
                      subtitle: { type: "string", description: "Context about the trend (max 80 chars)" },
                      sentiment: { type: "string", enum: ["exploding", "rising", "stable", "declining"] },
                      painPoints: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "3 specific pain points users express"
                      },
                      hiddenInsight: {
                        type: "object",
                        properties: {
                          surfaceAsk: { type: "string", description: "What people literally say they want" },
                          realProblem: { type: "string", description: "The deeper issue behind it" },
                          hiddenSignal: { type: "string", description: "The market opportunity this reveals" },
                        },
                        required: ["surfaceAsk", "realProblem", "hiddenSignal"],
                      },
                      demandVelocity: { type: "number", minimum: 1, maximum: 100 },
                      competitionGap: { type: "number", minimum: 1, maximum: 100 },
                    },
                    required: ["title", "subtitle", "sentiment", "painPoints", "hiddenInsight", "demandVelocity", "competitionGap"],
                  },
                },
              },
              required: ["problems"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "suggest_problems" } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI analysis error:", response.status, errorText);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const aiResult = await response.json();
  console.log("AI response received");

  // Extract the tool call result
  const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "suggest_problems") {
    console.error("No valid tool call in AI response");
    return [];
  }

  try {
    const parsed = JSON.parse(toolCall.function.arguments);
    const problems: AnalyzedProblem[] = parsed.problems.map((p: any) => ({
      title: p.title,
      subtitle: p.subtitle,
      category,
      sentiment: p.sentiment,
      painPoints: p.painPoints.slice(0, 3),
      hiddenInsight: p.hiddenInsight,
      demandVelocity: p.demandVelocity,
      competitionGap: p.competitionGap,
      opportunityScore: Math.round((p.demandVelocity * 0.6) + (p.competitionGap * 0.4)),
    }));

    console.log(`AI extracted ${problems.length} problems`);
    return problems;
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit: 20 requests per minute (search operation)
  const rateLimited = await withRateLimit(req, "search-tiktok", RateLimitPresets.search);
  if (rateLimited) return rateLimited;

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!APIFY_API_TOKEN) throw new Error('APIFY_API_TOKEN is not configured');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const rawBody = await req.json().catch(() => ({}));
    
    // Validate input with Zod
    const validation = validateInput(searchTikTokSchema, rawBody);
    if (!validation.success) {
      return validationErrorResponse(validation, corsHeaders);
    }
    
    const { niche, forceRefresh } = validation.data!;

    console.log(`Processing niche: ${niche}, forceRefresh: ${forceRefresh}`);

    const category = NICHE_CATEGORIES[niche] || niche;

    // Check cache first (unless force refresh requested)
    if (!forceRefresh) {
      const cached = await getCachedResults(supabase, niche);
      
      if (cached) {
        console.log(`Cache HIT for niche: ${niche}, ${cached.results.length} results`);
        
        const viralCount = cached.results.filter((r: any) => r.isViral).length;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: cached.results, 
            viralCount,
            source: "cache",
            cachedAt: cached.created_at,
            expiresAt: cached.expires_at,
            videosAnalyzed: cached.videos_analyzed,
            queries: cached.queries_used,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Cache MISS for niche: ${niche}`);
    }

    const queries = NICHE_QUERIES[niche];
    
    if (!queries || queries.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [], viralCount: 0, source: "real" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pick 2 random queries to get diverse results
    const shuffled = [...queries].sort(() => Math.random() - 0.5);
    const selectedQueries = shuffled.slice(0, 2);
    
    // Fetch TikTok data for each query
    let allVideos: TikTokVideo[] = [];
    for (const query of selectedQueries) {
      try {
        const videos = await fetchTikTokData(query, APIFY_API_TOKEN);
        allVideos = [...allVideos, ...videos];
      } catch (e) {
        console.error(`Failed to fetch for query "${query}":`, e);
      }
    }

    if (allVideos.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [], viralCount: 0, source: "real", error: "No TikTok data found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze with AI to extract problems
    const analyzedProblems = await analyzeWithAI(allVideos, niche, category, LOVABLE_API_KEY);

    if (analyzedProblems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [], viralCount: 0, source: "real", error: "AI analysis returned no problems" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate aggregate metrics from videos
    const totalViews = allVideos.reduce((sum, v) => sum + (v.playCount || 0), 0);
    const totalShares = allVideos.reduce((sum, v) => sum + (v.shareCount || 0), 0);
    const totalSaves = allVideos.reduce((sum, v) => sum + (v.collectCount || 0), 0);
    const avgEngagement = allVideos.reduce((sum, v) => {
      const views = v.playCount || 1;
      const engagement = ((v.diggCount || 0) + (v.shareCount || 0) + (v.collectCount || 0)) / views;
      return sum + engagement;
    }, 0) / allVideos.length;

    // Transform to result format
    const results = analyzedProblems.map((problem, index) => {
      const viewsPerProblem = Math.round(totalViews / analyzedProblems.length);
      const sharesPerProblem = Math.round(totalShares / analyzedProblems.length);
      const savesPerProblem = Math.round(totalSaves / analyzedProblems.length);
      
      const isViral = viewsPerProblem >= 100000 && avgEngagement >= 0.03;
      
      return {
        id: `${niche}-${Date.now()}-${index}`,
        title: problem.title,
        subtitle: problem.subtitle,
        category: problem.category,
        sentiment: problem.sentiment,
        views: viewsPerProblem,
        saves: savesPerProblem,
        shares: sharesPerProblem,
        shared: sharesPerProblem,
        painPoints: problem.painPoints,
        hiddenInsight: problem.hiddenInsight,
        rank: index + 1,
        isViral,
        opportunityScore: problem.opportunityScore,
        addedToLibrary: isViral,
        sources: generateSources(viewsPerProblem, avgEngagement),
        demandVelocity: problem.demandVelocity,
        competitionGap: problem.competitionGap,
      };
    }).sort((a, b) => b.opportunityScore - a.opportunityScore);

    console.log(`Processed ${results.length} AI-analyzed problems, ${results.filter(r => r.isViral).length} viral`);

    // Cache the results
    await setCachedResults(supabase, niche, results, allVideos.length, selectedQueries);

    // Save viral results to database
    const viralResults = results.filter(r => r.isViral);
    
    if (viralResults.length > 0) {
      for (const result of viralResults) {
        const { data: existing } = await supabase
          .from('problems')
          .select('id')
          .eq('title', result.title)
          .maybeSingle();

        if (!existing) {
          const problemData = {
            title: result.title,
            subtitle: result.subtitle,
            category: result.category,
            niche: niche.replace('-', ' '),
            sentiment: result.sentiment,
            opportunity_score: result.opportunityScore,
            views: result.views,
            saves: result.saves,
            shares: result.shares,
            is_viral: true,
            pain_points: result.painPoints,
            trending_rank: result.rank,
            sources: result.sources,
            slots_total: 20,
            slots_filled: 0,
            demand_velocity: result.demandVelocity,
            competition_gap: result.competitionGap,
            hidden_insight: result.hiddenInsight,
          };

          const { error } = await supabase.from('problems').insert(problemData);

          if (error) {
            console.error('Error inserting problem:', error);
          } else {
            console.log(`Added viral problem to library: ${result.title}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results, 
        viralCount: viralResults.length,
        source: "apify-tiktok-ai",
        queries: selectedQueries,
        videosAnalyzed: allVideos.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Search error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
