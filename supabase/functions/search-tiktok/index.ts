import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  authorMeta?: {
    name?: string;
    nickName?: string;
    verified?: boolean;
  };
  musicMeta?: {
    musicName?: string;
    musicAuthor?: string;
  };
  hashtags?: Array<{ name: string }>;
  videoMeta?: {
    duration?: number;
  };
  diggCount?: number;
  shareCount?: number;
  playCount?: number;
  commentCount?: number;
  collectCount?: number;
  webVideoUrl?: string;
}

interface ApifyRunResponse {
  data: {
    id: string;
    defaultDatasetId: string;
    status: string;
  };
}

// Niche to search query mapping for more relevant TikTok searches
const NICHE_QUERIES: Record<string, string[]> = {
  "mental-health": ["mental health tips", "anxiety help", "therapy alternatives", "stress relief", "burnout recovery"],
  "weight-fitness": ["weight loss journey", "fitness motivation", "gym anxiety", "workout tips", "diet struggles"],
  "skin-beauty": ["skincare routine", "adult acne", "skin problems", "beauty hacks", "anti aging"],
  "gut-health": ["bloating help", "gut health", "digestive issues", "IBS tips", "food sensitivity"],
  "productivity": ["productivity tips", "focus hacks", "time management", "work from home", "ADHD tips"],
  "career": ["career advice", "job hunting", "salary negotiation", "work life balance", "career change"],
  "social": ["social anxiety", "making friends", "dating tips", "relationship advice", "confidence building"],
};

// Keywords that indicate pain points
const PAIN_INDICATORS = [
  "struggle", "problem", "help", "hate", "can't", "don't know", "frustrated",
  "tired of", "sick of", "wish", "need", "want", "why", "how to", "anyone else",
  "am i the only", "does anyone", "is it normal", "advice", "tips", "hack",
  "finally found", "game changer", "life saver", "this helped", "try this"
];

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function generateSources(views: number, engagement: number): TrendSignal[] {
  return [
    { source: "tiktok", metric: "Views", value: formatNumber(views), change: Math.round(engagement * 100), icon: "📱" },
    { source: "tiktok", metric: "Engagement", value: `${(engagement * 100).toFixed(1)}%`, change: Math.round(engagement * 50), icon: "💬" },
  ];
}

function checkVirality(views: number, shares: number, saves: number): boolean {
  const engagement = (shares + saves) / Math.max(views, 1);
  return views >= 100000 && engagement >= 0.03;
}

function calculateOpportunityScore(engagement: number, views: number): number {
  // Higher engagement + high views = higher opportunity
  const engagementScore = Math.min(engagement * 1000, 50);
  const viewsScore = Math.min((views / 1000000) * 30, 30);
  const baseScore = 20;
  return Math.round(baseScore + engagementScore + viewsScore);
}

function extractPainPoints(text: string): string[] {
  const painPoints: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences.slice(0, 3)) {
    const trimmed = sentence.trim();
    if (trimmed.length > 20 && trimmed.length < 150) {
      // Check if it contains pain indicators
      const hasPainIndicator = PAIN_INDICATORS.some(indicator => 
        trimmed.toLowerCase().includes(indicator)
      );
      if (hasPainIndicator || painPoints.length < 2) {
        painPoints.push(trimmed);
      }
    }
  }
  
  return painPoints.slice(0, 3);
}

function determineSentiment(engagement: number, views: number): "exploding" | "rising" | "stable" | "declining" {
  if (views >= 1000000 && engagement >= 0.05) return "exploding";
  if (views >= 500000 || engagement >= 0.04) return "rising";
  if (views >= 100000) return "stable";
  return "declining";
}

function extractTitle(text: string): string {
  // Get first sentence or first 80 chars
  const firstSentence = text.split(/[.!?]/)[0]?.trim() || text;
  if (firstSentence.length <= 80) return firstSentence;
  return firstSentence.substring(0, 77) + "...";
}

function extractSubtitle(text: string, hashtags: string[]): string {
  // Use hashtags or second part of text
  if (hashtags.length >= 2) {
    return `Trending: #${hashtags.slice(0, 3).join(" #")}`;
  }
  const sentences = text.split(/[.!?]+/);
  if (sentences.length > 1) {
    const second = sentences[1]?.trim();
    if (second && second.length > 10 && second.length < 100) {
      return second;
    }
  }
  return "TikTok trend insight";
}

async function fetchTikTokData(query: string, apiToken: string): Promise<TikTokVideo[]> {
  console.log(`Fetching TikTok data for query: ${query}`);
  
  // Start the Apify actor run
  const actorId = "clockworks~free-tiktok-scraper";
  const startUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiToken}`;
  
  const startResponse = await fetch(startUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      searchQueries: [query],
      maxProfilesPerQuery: 0,
      maxVideosPerQuery: 10,
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

  // Wait for the run to complete (poll every 2 seconds, max 60 seconds)
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusUrl = `https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${apiToken}`;
    const statusResponse = await fetch(statusUrl);
    
    if (!statusResponse.ok) {
      console.error("Status check failed");
      attempts++;
      continue;
    }
    
    const statusData = await statusResponse.json();
    const status = statusData.data.status;
    
    console.log(`Run status: ${status}`);
    
    if (status === "SUCCEEDED") {
      // Fetch the results
      const resultsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiToken}`;
      const resultsResponse = await fetch(resultsUrl);
      
      if (!resultsResponse.ok) {
        throw new Error("Failed to fetch results");
      }
      
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');

    if (!APIFY_API_TOKEN) {
      throw new Error('APIFY_API_TOKEN is not configured');
    }

    const { niche } = await req.json();
    
    if (!niche || typeof niche !== 'string') {
      throw new Error('Niche selection is required');
    }

    console.log(`Processing niche: ${niche}`);

    const queries = NICHE_QUERIES[niche];
    
    if (!queries || queries.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [], viralCount: 0, source: "real" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pick a random query from the niche
    const selectedQuery = queries[Math.floor(Math.random() * queries.length)];
    
    // Fetch real TikTok data
    const videos = await fetchTikTokData(selectedQuery, APIFY_API_TOKEN);

    // Transform TikTok videos into pain point results
    const results = videos
      .filter(video => video.text && video.playCount)
      .map((video, index) => {
        const views = video.playCount || 0;
        const shares = video.shareCount || 0;
        const saves = video.collectCount || 0;
        const comments = video.commentCount || 0;
        const likes = video.diggCount || 0;
        
        const totalEngagement = shares + saves + comments + likes;
        const engagement = totalEngagement / Math.max(views, 1);
        
        const isViral = checkVirality(views, shares, saves);
        const opportunityScore = calculateOpportunityScore(engagement, views);
        const sources = generateSources(views, engagement);
        
        const hashtags = video.hashtags?.map(h => h.name) || [];
        const painPoints = extractPainPoints(video.text);
        
        return {
          id: video.id || `tiktok-${Date.now()}-${index}`,
          title: extractTitle(video.text),
          subtitle: extractSubtitle(video.text, hashtags),
          category: niche.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()),
          sentiment: determineSentiment(engagement, views),
          views,
          saves,
          shares,
          shared: shares, // Alias for compatibility
          painPoints,
          rank: index + 1,
          isViral,
          opportunityScore,
          addedToLibrary: isViral,
          sources,
          demandVelocity: Math.round(engagement * 100),
          competitionGap: Math.round(100 - (views / 100000)),
          webVideoUrl: video.webVideoUrl,
        };
      })
      .sort((a, b) => b.opportunityScore - a.opportunityScore);

    console.log(`Found ${results.length} real TikTok videos, ${results.filter(r => r.isViral).length} viral`);

    // Save viral results to database
    const viralResults = results.filter(r => r.isViral);
    
    if (viralResults.length > 0) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
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
            slots_total: 100,
            slots_filled: 0,
            demand_velocity: result.demandVelocity,
            competition_gap: result.competitionGap,
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
        source: "apify-tiktok",
        query: selectedQuery
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
