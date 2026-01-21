import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
}

function rateCompetitor(title: string, snippet: string, position: number): { rating: number; label: string } {
  // Rate based on various signals
  let score = 0;
  
  // Position weight (higher position = more established)
  if (position <= 3) score += 30;
  else if (position <= 6) score += 20;
  else score += 10;
  
  // Content signals
  const text = (title + " " + snippet).toLowerCase();
  
  // Funding/growth signals
  if (text.includes("series") || text.includes("funding") || text.includes("raised")) score += 15;
  if (text.includes("million") || text.includes("billion")) score += 10;
  
  // User/traction signals
  if (text.includes("users") || text.includes("customers")) score += 15;
  if (text.includes("popular") || text.includes("leading") || text.includes("top")) score += 10;
  
  // Product maturity signals
  if (text.includes("free trial") || text.includes("pricing")) score += 10;
  if (text.includes("app store") || text.includes("play store")) score += 10;
  if (text.includes("enterprise") || text.includes("business")) score += 5;
  
  // Review/rating signals
  if (text.includes("review") || text.includes("rating")) score += 5;
  if (text.includes("best") || text.includes("recommended")) score += 10;
  
  // Cap at 100
  const rating = Math.min(100, Math.max(10, score));
  
  let label: string;
  if (rating >= 80) label = "Major Player";
  else if (rating >= 60) label = "Established";
  else if (rating >= 40) label = "Growing";
  else label = "Emerging";
  
  return { rating, label };
}

function extractCompanyName(title: string, url: string): string {
  // Try to extract company name from URL first
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "").split(".")[0];
    // Capitalize first letter
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    // Fall back to first few words of title
    const words = title.split(/[-|:]/).map(s => s.trim())[0];
    return words.substring(0, 30);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemTitle, niche, painPoints } = await req.json();
    
    if (!problemTitle) {
      return new Response(
        JSON.stringify({ error: "Problem title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
    if (!SERP_API_KEY) {
      console.error("SERP_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "SERP API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
    
    for (let i = 0; i < Math.min(organicResults.length, 8); i++) {
      const result = organicResults[i];
      
      // Skip non-relevant results
      if (!result.link || !result.title) continue;
      
      // Skip common non-competitor sites
      const skipDomains = ["wikipedia", "reddit", "quora", "youtube", "medium", "twitter", "facebook", "linkedin"];
      const domain = new URL(result.link).hostname.toLowerCase();
      if (skipDomains.some(d => domain.includes(d))) continue;
      
      const name = extractCompanyName(result.title, result.link);
      const { rating, label } = rateCompetitor(result.title, result.snippet || "", i + 1);
      
      competitors.push({
        name,
        url: result.link,
        description: result.snippet || "",
        rating,
        ratingLabel: label,
        position: i + 1,
      });
    }

    // Sort by rating
    competitors.sort((a, b) => b.rating - a.rating);

    console.log("Processed competitors:", competitors.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        competitors,
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
