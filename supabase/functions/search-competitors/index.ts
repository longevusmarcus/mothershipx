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
  source?: "serp" | "hackernews";
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

interface HNHit {
  title: string;
  url: string | null;
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
  objectID: string;
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
    let domain = urlObj.hostname.replace("www.", "").split(".")[0];
    // Capitalize properly
    domain = domain.charAt(0).toUpperCase() + domain.slice(1);
    // If it's a generic domain like "apps" or "tools", use title
    if (["apps", "tools", "software", "get", "try", "use", "my"].includes(domain.toLowerCase())) {
      const words = title.split(/[-|:]/).map(s => s.trim())[0];
      return words.substring(0, 30);
    }
    return domain;
  } catch {
    const words = title.split(/[-|:]/).map(s => s.trim())[0];
    return words.substring(0, 30);
  }
}

// Check if a result looks like an actual app/startup/product vs a news article
function isLikelyApp(title: string, snippet: string, url: string): boolean {
  const text = (title + " " + snippet).toLowerCase();
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // STRICT NEGATIVE CHECK FIRST - reject anything that looks like an article/blog
  const strictArticleIndicators = [
    // Blog/article patterns
    "blog", "article", "news", "report", "study", "research",
    "journalist", "editor", "magazine", "newsletter", "opinion", "editorial",
    "according to", "said in", "published", "announced today",
    // List articles (these are NOT the products themselves)
    "top 5", "top 10", "top 11", "best 5", "best 10", "best 11",
    "top ai tools", "best ai tools", "best apps for",
    "compare top", "expert reviews", "find 11", "find 10", "find 5",
    "below, you'll find", "here are the best", "we've compiled",
    "roundup", "comparison", "vs.", "versus",
    // Job boards (not products)
    "job search", "job boards", "job alerts", "job listings", "find jobs",
    "indeed", "linkedin", "glassdoor", "ziprecruiter",
    // Generic/non-product sites
    "unified search across", "customizable job alerts"
  ];
  
  if (strictArticleIndicators.some(indicator => text.includes(indicator))) {
    console.log("Rejected (article indicator):", title.substring(0, 50));
    return false;
  }
  
  // Reject if the name sounds like a blog or content site
  const blogNamePatterns = ["blog", "news", "times", "daily", "weekly", "analytics", "insights", "guide"];
  if (blogNamePatterns.some(pattern => titleLower.startsWith(pattern) || urlLower.includes(pattern + "."))) {
    console.log("Rejected (blog name pattern):", title.substring(0, 50));
    return false;
  }
  
  // POSITIVE SIGNALS - these indicate actual products
  // Domain extensions that are almost always startups/apps
  const appDomains = [".io", ".app", ".co", ".ai", ".so", ".dev", ".tools", ".run", ".work"];
  const hasAppDomain = appDomains.some(ext => {
    const domain = urlLower.split("/")[2] || "";
    return domain.endsWith(ext);
  });
  
  // Review/comparison sites that list real products (we extract products from these)
  const productListingSites = [
    "getapp.com", "capterra.com", "g2.com", "g2crowd.com", "trustpilot.com",
    "softwareadvice.com", "alternativeto.net", "producthunt.com", "crunchbase.com",
    "appsumo.com", "betalist.com"
  ];
  const isProductListing = productListingSites.some(site => urlLower.includes(site));
  
  // Strong product signals in text
  const strongProductSignals = [
    "sign up", "get started", "try free", "free trial", "pricing",
    "start your", "create account", "book a demo", "request demo",
    "download now", "install", "add to chrome", "mobile app",
    "for teams", "for business", "enterprise", "pro plan",
    "integrations", "api docs", "documentation", "sdk",
    "dashboard", "your workspace", "my account"
  ];
  const hasProductSignal = strongProductSignals.some(signal => text.includes(signal));
  
  // Must have at least one strong positive signal
  if (hasAppDomain || isProductListing || hasProductSignal) {
    console.log("Accepted (has positive signal):", title.substring(0, 50));
    return true;
  }
  
  console.log("Rejected (no positive signals):", title.substring(0, 50));
  return false;
}

// Search Hacker News for relevant startups/products
async function searchHackerNews(problemTitle: string, niche?: string): Promise<Competitor[]> {
  const competitors: Competitor[] = [];
  
  try {
    // Build search queries for HN
    const searchTerms = niche 
      ? `${niche} startup OR ${niche} app OR ${problemTitle} tool`
      : `${problemTitle} startup OR ${problemTitle} app`;
    
    const hnUrl = new URL("https://hn.algolia.com/api/v1/search");
    hnUrl.searchParams.set("query", searchTerms);
    hnUrl.searchParams.set("tags", "story");
    hnUrl.searchParams.set("hitsPerPage", "20");
    // Filter for posts with at least some engagement
    hnUrl.searchParams.set("numericFilters", "points>10");
    
    console.log("Searching Hacker News:", searchTerms);
    
    const response = await fetch(hnUrl.toString());
    
    if (!response.ok) {
      console.error("HN API error:", response.status);
      return [];
    }
    
    const data = await response.json();
    const hits: HNHit[] = data.hits || [];
    
    console.log("HN results:", hits.length);
    
    const seenDomains = new Set<string>();
    
    for (const hit of hits) {
      // Skip if no URL (Ask HN, etc.)
      if (!hit.url) continue;
      
      try {
        const urlObj = new URL(hit.url);
        const domain = urlObj.hostname.toLowerCase().replace("www.", "");
        
        // Skip common non-startup domains
        const skipDomains = [
          "github.com", "medium.com", "twitter.com", "youtube.com", 
          "wikipedia.org", "reddit.com", "news.ycombinator.com",
          "nytimes.com", "wsj.com", "techcrunch.com", "theverge.com",
          "bloomberg.com", "reuters.com", "bbc.com", "cnn.com",
          "docs.google.com", "drive.google.com", "arxiv.org"
        ];
        
        if (skipDomains.some(d => domain.includes(d))) continue;
        
        // Skip duplicates
        const baseDomain = domain.split(".").slice(-2).join(".");
        if (seenDomains.has(baseDomain)) continue;
        seenDomains.add(baseDomain);
        
        // Check if this looks like a startup/product launch
        const titleLower = hit.title.toLowerCase();
        const isLaunch = titleLower.includes("launch") || 
                         titleLower.includes("show hn") ||
                         titleLower.includes("introducing") ||
                         titleLower.includes("announce") ||
                         titleLower.includes("built") ||
                         titleLower.includes("made") ||
                         titleLower.includes("created") ||
                         titleLower.includes("app") ||
                         titleLower.includes("tool") ||
                         titleLower.includes("startup") ||
                         domain.endsWith(".io") ||
                         domain.endsWith(".ai") ||
                         domain.endsWith(".app") ||
                         domain.endsWith(".co");
        
        if (!isLaunch && hit.points < 50) continue;
        
        // Calculate rating based on HN engagement
        let rating = 30; // Base
        if (hit.points >= 500) rating += 40;
        else if (hit.points >= 200) rating += 30;
        else if (hit.points >= 100) rating += 20;
        else if (hit.points >= 50) rating += 10;
        
        if (hit.num_comments >= 100) rating += 15;
        else if (hit.num_comments >= 50) rating += 10;
        else if (hit.num_comments >= 20) rating += 5;
        
        rating = Math.min(95, rating);
        
        let ratingLabel: string;
        if (rating >= 80) ratingLabel = "Major Player";
        else if (rating >= 60) ratingLabel = "Established";
        else if (rating >= 40) ratingLabel = "Growing";
        else ratingLabel = "Emerging";
        
        // Extract company name from domain
        let name = baseDomain.split(".")[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);
        
        competitors.push({
          name,
          url: hit.url,
          description: `${hit.title} (${hit.points} points, ${hit.num_comments} comments on HN)`,
          rating,
          ratingLabel,
          position: competitors.length + 1,
          isNew: true,
          source: "hackernews",
        });
        
        if (competitors.length >= 5) break;
      } catch {
        continue;
      }
    }
    
    return competitors;
  } catch (error) {
    console.error("Error searching Hacker News:", error);
    return [];
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

    // Build search queries specifically targeting PRODUCTS - not articles about products
    // Use site: operator to target actual product sites
    const searchQueries = [
      `site:producthunt.com ${niche || problemTitle}`,
      `${problemTitle} app site:.io OR site:.app OR site:.ai`,
      `"try free" OR "get started" ${niche || problemTitle} tool`,
    ];
    
    // Use first query as primary
    const primaryQuery = searchQueries[0];
    console.log("Searching for competitors:", primaryQuery);

    // Call SERP API with improved query
    const serpUrl = new URL("https://serpapi.com/search.json");
    serpUrl.searchParams.set("q", primaryQuery);
    serpUrl.searchParams.set("api_key", SERP_API_KEY);
    serpUrl.searchParams.set("num", "15");
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

    // Process organic results with stricter filtering
    const competitors: Competitor[] = [];
    const organicResults = data.organic_results || [];
    
    // Expanded skip list - news sites, publications, social media, etc.
    const skipDomains = [
      // Social media
      "wikipedia", "reddit", "quora", "youtube", "medium", "twitter", "facebook", 
      "linkedin", "pinterest", "tiktok", "instagram", "threads", "x.com",
      // News and publications
      "nytimes", "wsj", "forbes", "businessinsider", "techcrunch", "wired", 
      "theverge", "cnn", "bbc", "bloomberg", "reuters", "huffpost", "guardian",
      "usatoday", "washingtonpost", "latimes", "nypost", "dailymail", "mirror",
      "independent", "telegraph", "express", "sun", "metro", "standard",
      // Academic and research
      "researchgate", "academia", "sciencedirect", "springer", "nature.com",
      "jstor", "ssrn", "arxiv", "pubmed", "scholar.google",
      // General info sites
      "indeed", "glassdoor", "ziprecruiter", "monster", "careerbuilder",
      // News aggregators and local news
      "news.google", "yahoo", "msn", "aol", "newsweek", "time.com",
      "centredaily", "miamiherald", "stacker", "highbrowmagazine", "ere",
      "newsletter", "substack", "beehiiv", "ghost.io",
      // Government and org sites
      ".gov", ".edu", ".org",
    ];
    
    const seenDomains = new Set<string>();
    
    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      if (!result.link || !result.title) continue;
      
      try {
        const urlObj = new URL(result.link);
        const domain = urlObj.hostname.toLowerCase();
        
        // Skip if domain is in skip list
        if (skipDomains.some(d => domain.includes(d))) {
          console.log("Skipping non-app domain:", domain);
          continue;
        }
        
        // Skip duplicate domains
        const baseDomain = domain.replace("www.", "").split(".").slice(-2).join(".");
        if (seenDomains.has(baseDomain)) continue;
        
        // Check if this looks like an actual app/startup
        if (!isLikelyApp(result.title, result.snippet || "", result.link)) {
          console.log("Skipping non-app result:", result.title);
          continue;
        }
        
        seenDomains.add(baseDomain);
      } catch {
        continue;
      }
      
      const name = extractCompanyName(result.title, result.link);
      const { rating, label } = rateCompetitor(result.title, result.snippet || "", competitors.length + 1);
      
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
        position: competitors.length + 1,
        previousRating,
        ratingChange,
        firstSeenAt: existing?.first_seen_at,
        isNew,
      });
      
      // Stop after finding 6 good competitors from SERP (leave room for HN)
      if (competitors.length >= 6) break;
    }

    // Also search Hacker News for additional competitors
    console.log("Searching Hacker News for additional competitors...");
    const hnCompetitors = await searchHackerNews(problemTitle, niche);
    
    // Merge HN competitors, avoiding duplicates
    const existingUrls = new Set(competitors.map(c => {
      try {
        return new URL(c.url).hostname.replace("www.", "");
      } catch {
        return c.url;
      }
    }));
    
    for (const hnComp of hnCompetitors) {
      try {
        const hnDomain = new URL(hnComp.url).hostname.replace("www.", "");
        if (!existingUrls.has(hnDomain)) {
          existingUrls.add(hnDomain);
          competitors.push(hnComp);
        }
      } catch {
        competitors.push(hnComp);
      }
    }
    
    console.log("Total competitors after HN merge:", competitors.length);

    // Sort by rating
    competitors.sort((a, b) => b.rating - a.rating);
    
    // Limit to top 10
    const topCompetitors = competitors.slice(0, 10);

    // Save competitors to database if problemId provided
    if (problemId && topCompetitors.length > 0) {
      const now = new Date().toISOString();
      
      for (const comp of topCompetitors) {
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
      
      console.log("Saved", topCompetitors.length, "competitors to database");
    }

    // Calculate threat level
    const threatLevel = calculateThreatLevel(topCompetitors, opportunityScore || 50);

    console.log("Processed competitors:", topCompetitors.length, "Threat level:", threatLevel.level);

    return new Response(
      JSON.stringify({ 
        success: true, 
        competitors: topCompetitors,
        threatLevel,
        query: primaryQuery,
        sources: ["serp", "hackernews"],
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
