import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TikTokItem {
  id?: string;
  text?: string;
  desc?: string;
  createTime?: number;
  diggCount?: number;
  shareCount?: number;
  commentCount?: number;
  playCount?: number;
  authorMeta?: {
    name?: string;
    nickName?: string;
  };
  hashtags?: Array<{ name: string }>;
  webVideoUrl?: string;
}

interface ProcessedResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  sentiment: "exploding" | "rising" | "stable" | "declining";
  views: number;
  saves: number;
  shares: number;
  painPoints: string[];
  sources: Array<{ source: string; metric: string; value: string }>;
  isViral: boolean;
  opportunityScore: number;
}

// Extract pain points from text using keyword analysis
function extractPainPoints(text: string): string[] {
  const painIndicators = [
    /(?:i\s+)?(?:struggle|struggling)\s+(?:with|to)/gi,
    /(?:i\s+)?(?:can't|cannot|can not)\s+(?:find|get|make|do)/gi,
    /(?:i\s+)?(?:hate|hating)\s+(?:when|how|that)/gi,
    /(?:i\s+)?(?:wish|wished)\s+(?:i|there|someone)/gi,
    /(?:i\s+)?(?:need|needed)\s+(?:help|a|to)/gi,
    /(?:why\s+)?(?:is\s+it\s+so\s+hard)/gi,
    /(?:i'm\s+)?(?:tired|exhausted)\s+(?:of|from)/gi,
    /(?:i\s+)?(?:don't|do not)\s+(?:know|understand)/gi,
    /(?:frustrat(?:ed|ing))/gi,
    /(?:overwhelm(?:ed|ing))/gi,
    /(?:anxious|anxiety)\s+(?:about|when)/gi,
    /(?:stress(?:ed|ful))\s+(?:about|when|because)/gi,
  ];

  const painPoints: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

  for (const sentence of sentences) {
    for (const indicator of painIndicators) {
      if (indicator.test(sentence)) {
        const cleaned = sentence.trim().slice(0, 100);
        if (cleaned.length > 20 && !painPoints.includes(cleaned)) {
          painPoints.push(cleaned);
        }
        break;
      }
    }
  }

  return painPoints.slice(0, 5);
}

// Determine sentiment based on engagement metrics
function determineSentiment(views: number, shares: number): "exploding" | "rising" | "stable" | "declining" {
  const engagement = views > 0 ? (shares / views) * 100 : 0;
  
  if (views > 1000000 && engagement > 5) return "exploding";
  if (views > 100000 && engagement > 2) return "rising";
  if (views > 10000) return "stable";
  return "declining";
}

// Calculate virality based on thresholds
function checkVirality(views: number, shares: number, saves: number): boolean {
  const totalEngagement = shares + saves;
  const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;
  
  // Viral if: 100k+ views AND engagement rate > 3% OR 1M+ views
  return (views >= 100000 && engagementRate > 3) || views >= 1000000;
}

// Calculate opportunity score
function calculateOpportunityScore(views: number, shares: number, saves: number, painPointCount: number): number {
  const viewScore = Math.min(views / 100000, 30); // Max 30 points
  const engagementScore = Math.min((shares + saves) / 10000, 30); // Max 30 points
  const painScore = painPointCount * 8; // 8 points per pain point, max 40
  
  return Math.min(Math.round(viewScore + engagementScore + painScore), 100);
}

// Categorize based on search query and content
function categorizeContent(query: string, text: string): string {
  const categories: Record<string, string[]> = {
    "Mental Health": ["mental", "anxiety", "depression", "stress", "therapy", "wellness", "mindfulness"],
    "Productivity": ["productivity", "focus", "work", "time", "schedule", "organize"],
    "Fitness": ["fitness", "workout", "exercise", "gym", "health", "weight"],
    "Finance": ["money", "finance", "budget", "invest", "save", "debt"],
    "Education": ["learn", "study", "course", "skill", "education", "school"],
    "Relationships": ["relationship", "dating", "love", "friend", "social"],
    "Career": ["career", "job", "interview", "resume", "work", "promotion"],
    "Technology": ["tech", "app", "software", "code", "ai", "tool"],
  };

  const combinedText = `${query} ${text}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => combinedText.includes(kw))) {
      return category;
    }
  }
  
  return "General";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!APIFY_API_TOKEN) {
      throw new Error('APIFY_API_TOKEN not configured');
    }

    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required');
    }

    console.log(`Processing search query: ${query}`);

    // Fetch TikTok data from Apify dataset
    const response = await fetch(
      `https://api.apify.com/v2/datasets/ZkuHf2i8lHalEdzD8/items?token=${APIFY_API_TOKEN}&limit=50`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    const tiktokData: TikTokItem[] = await response.json();
    console.log(`Fetched ${tiktokData.length} TikTok items`);

    // Filter and process results based on search query
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    const results: ProcessedResult[] = tiktokData
      .filter(item => {
        const text = `${item.text || ''} ${item.desc || ''}`.toLowerCase();
        const hashtags = item.hashtags?.map(h => h.name.toLowerCase()).join(' ') || '';
        const combined = `${text} ${hashtags}`;
        
        // Match if any query term is found
        return queryTerms.some(term => combined.includes(term));
      })
      .slice(0, 10)
      .map((item, index) => {
        const text = `${item.text || ''} ${item.desc || ''}`;
        const views = item.playCount || 0;
        const shares = item.shareCount || 0;
        const saves = item.diggCount || 0; // likes as proxy for saves
        const painPoints = extractPainPoints(text);
        
        return {
          id: `search-${Date.now()}-${index}`,
          title: text.slice(0, 80) + (text.length > 80 ? '...' : ''),
          subtitle: `By @${item.authorMeta?.nickName || item.authorMeta?.name || 'unknown'} • ${item.hashtags?.slice(0, 3).map(h => `#${h.name}`).join(' ') || ''}`,
          category: categorizeContent(query, text),
          sentiment: determineSentiment(views, shares),
          views,
          saves,
          shares,
          painPoints,
          sources: [
            { source: "TikTok", metric: "views", value: views >= 1000000 ? `${(views / 1000000).toFixed(1)}M` : `${Math.round(views / 1000)}K` },
            { source: "TikTok", metric: "shares", value: shares >= 1000 ? `${Math.round(shares / 1000)}K` : String(shares) },
          ],
          isViral: checkVirality(views, shares, saves),
          opportunityScore: calculateOpportunityScore(views, shares, saves, painPoints.length),
        };
      });

    console.log(`Processed ${results.length} results, ${results.filter(r => r.isViral).length} viral`);

    // Add viral results to the problems table
    const viralResults = results.filter(r => r.isViral);
    
    if (viralResults.length > 0) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      for (const result of viralResults) {
        const problemData = {
          title: result.title,
          subtitle: result.subtitle,
          category: result.category,
          niche: query,
          sentiment: result.sentiment,
          opportunity_score: result.opportunityScore,
          views: result.views,
          saves: result.saves,
          shares: result.shares,
          is_viral: true,
          pain_points: result.painPoints,
          sources: result.sources,
          slots_total: 100,
          slots_filled: 0,
          demand_velocity: Math.round(result.opportunityScore * 0.8),
          competition_gap: Math.round(100 - result.opportunityScore * 0.3),
        };

        const { error } = await supabase
          .from('problems')
          .insert(problemData);

        if (error) {
          console.error('Error inserting problem:', error);
        } else {
          console.log(`Added viral problem to library: ${result.title.slice(0, 50)}`);
        }
      }
    }

    // Mark results that were added to library
    const finalResults = results.map(r => ({
      ...r,
      addedToLibrary: r.isViral,
    }));

    return new Response(
      JSON.stringify({ success: true, data: finalResults, viralCount: viralResults.length }),
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
