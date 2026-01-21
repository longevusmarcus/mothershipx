import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Competitor {
  name: string;
  url: string;
  description: string;
  rating: number;
  ratingLabel: string;
  position: number;
  previousRating?: number;
  ratingChange?: number;
  firstSeenAt?: string;
  isNew?: boolean;
}

interface DbCompetitor {
  id: string;
  problem_id: string;
  name: string;
  url: string;
  description: string | null;
  rating: number;
  rating_label: string;
  position: number | null;
  previous_rating: number | null;
  rating_change: number;
  first_seen_at: string;
  last_seen_at: string;
}

function rateCompetitor(title: string, snippet: string, position: number): { rating: number; label: string } {
  let score = 0;
  
  if (position <= 3) score += 30;
  else if (position <= 6) score += 20;
  else score += 10;
  
  const text = (title + " " + snippet).toLowerCase();
  
  if (text.includes("series") || text.includes("funding") || text.includes("raised")) score += 15;
  if (text.includes("million") || text.includes("billion")) score += 10;
  if (text.includes("users") || text.includes("customers")) score += 15;
  if (text.includes("popular") || text.includes("leading") || text.includes("top")) score += 10;
  if (text.includes("free trial") || text.includes("pricing")) score += 10;
  if (text.includes("app store") || text.includes("play store")) score += 10;
  if (text.includes("enterprise") || text.includes("business")) score += 5;
  if (text.includes("review") || text.includes("rating")) score += 5;
  if (text.includes("best") || text.includes("recommended")) score += 10;
  
  const rating = Math.min(100, Math.max(10, score));
  
  let label: string;
  if (rating >= 80) label = "Major Player";
  else if (rating >= 60) label = "Established";
  else if (rating >= 40) label = "Growing";
  else label = "Emerging";
  
  return { rating, label };
}

function extractCompanyName(title: string, url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "").split(".")[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    const words = title.split(/[-|:]/).map(s => s.trim())[0];
    return words.substring(0, 30);
  }
}

function calculateThreatLevel(competitors: Competitor[], opportunityScore: number): {
  level: string;
  score: number;
  description: string;
} {
  if (competitors.length === 0) {
    return { level: "Low", score: 20, description: "No significant competitors found" };
  }

  // Calculate average competitor rating
  const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
  const maxRating = Math.max(...competitors.map(c => c.rating));
  const majorPlayers = competitors.filter(c => c.rating >= 80).length;
  
  // Threat score based on competitor strength vs opportunity
  let threatScore = 0;
  
  // Base on average competitor rating
  threatScore += avgRating * 0.4;
  
  // Penalize for major players
  threatScore += majorPlayers * 10;
  
  // Adjust based on opportunity score (higher opportunity = lower threat perception)
  threatScore = threatScore * (1 - (opportunityScore / 200));
  
  // Cap between 10-100
  threatScore = Math.min(100, Math.max(10, Math.round(threatScore)));
  
  let level: string;
  let description: string;
  
  if (threatScore >= 75) {
    level = "Critical";
    description = "Highly competitive market with established players";
  } else if (threatScore >= 55) {
    level = "High";
    description = "Strong competition, differentiation crucial";
  } else if (threatScore >= 35) {
    level = "Moderate";
    description = "Some competition, opportunities exist";
  } else {
    level = "Low";
    description = "Underserved market with few competitors";
  }
  
  return { level, score: threatScore, description };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemId, problemTitle, niche, opportunityScore } = await req.json();
    
    if (!problemTitle) {
      return new Response(
        JSON.stringify({ error: "Problem title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SERP_API_KEY) {
      console.error("SERP_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "SERP API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client for saving competitors
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch existing competitors for this problem
    let existingCompetitors: DbCompetitor[] = [];
    if (problemId) {
      const { data: existing } = await supabase
        .from("problem_competitors")
        .select("*")
        .eq("problem_id", problemId);
      existingCompetitors = existing || [];
    }

    // Build search query
    const searchQuery = `${problemTitle} app software solution`;
    console.log("Searching for competitors:", searchQuery);

    // Call SERP API
    const serpUrl = new URL("https://serpapi.com/search.json");
    serpUrl.searchParams.set("q", searchQuery);
    serpUrl.searchParams.set("api_key", SERP_API_KEY);
    serpUrl.searchParams.set("num", "10");
    serpUrl.searchParams.set("gl", "us");
    serpUrl.searchParams.set("hl", "en");

    const response = await fetch(serpUrl.toString());
    
    if (!response.ok) {
      console.error("SERP API error:", response.status, await response.text());
      return new Response(
        JSON.stringify({ error: "Failed to fetch competitor data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("SERP response received, organic results:", data.organic_results?.length || 0);

    // Process organic results
    const competitors: Competitor[] = [];
    const organicResults = data.organic_results || [];
    const skipDomains = ["wikipedia", "reddit", "quora", "youtube", "medium", "twitter", "facebook", "linkedin", "pinterest", "tiktok"];
    
    for (let i = 0; i < Math.min(organicResults.length, 10); i++) {
      const result = organicResults[i];
      if (!result.link || !result.title) continue;
      
      try {
        const domain = new URL(result.link).hostname.toLowerCase();
        if (skipDomains.some(d => domain.includes(d))) continue;
      } catch {
        continue;
      }
      
      const name = extractCompanyName(result.title, result.link);
      const { rating, label } = rateCompetitor(result.title, result.snippet || "", i + 1);
      
      // Check if this competitor existed before
      const existing = existingCompetitors.find(e => e.url === result.link);
      const previousRating = existing?.rating;
      const ratingChange = previousRating ? rating - previousRating : 0;
      const isNew = !existing;
      
      competitors.push({
        name,
        url: result.link,
        description: result.snippet || "",
        rating,
        ratingLabel: label,
        position: i + 1,
        previousRating,
        ratingChange,
        firstSeenAt: existing?.first_seen_at,
        isNew,
      });
    }

    // Sort by rating
    competitors.sort((a, b) => b.rating - a.rating);

    // Save competitors to database if problemId provided
    if (problemId && competitors.length > 0) {
      const now = new Date().toISOString();
      
      for (const comp of competitors) {
        const existing = existingCompetitors.find(e => e.url === comp.url);
        
        if (existing) {
          // Update existing competitor
          await supabase
            .from("problem_competitors")
            .update({
              name: comp.name,
              description: comp.description,
              rating: comp.rating,
              rating_label: comp.ratingLabel,
              position: comp.position,
              previous_rating: existing.rating,
              rating_change: comp.rating - existing.rating,
              last_seen_at: now,
            })
            .eq("id", existing.id);
        } else {
          // Insert new competitor
          await supabase
            .from("problem_competitors")
            .insert({
              problem_id: problemId,
              name: comp.name,
              url: comp.url,
              description: comp.description,
              rating: comp.rating,
              rating_label: comp.ratingLabel,
              position: comp.position,
              previous_rating: null,
              rating_change: 0,
              first_seen_at: now,
              last_seen_at: now,
            });
        }
      }
      
      console.log("Saved", competitors.length, "competitors to database");
    }

    // Calculate threat level
    const threatLevel = calculateThreatLevel(competitors, opportunityScore || 50);

    console.log("Processed competitors:", competitors.length, "Threat level:", threatLevel.level);

    return new Response(
      JSON.stringify({ 
        success: true, 
        competitors,
        threatLevel,
        query: searchQuery,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in search-competitors:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
