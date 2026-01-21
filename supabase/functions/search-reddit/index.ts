import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Subreddit configurations
const SUBREDDITS = {
  "findapath": {
    id: "findapath",
    name: "r/findapath",
    description: "Career guidance & life direction",
    category: "Career"
  }
};

interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  upvote_ratio: number;
}

interface AnalyzedProblem {
  title: string;
  description: string;
  opportunityScore: number;
  sentiment: string;
  category: string;
  surfaceAsk: string;
  realProblem: string;
  hiddenSignal: string;
  painPoints: string[];
}

const RAPIDAPI_HOST = "reddit34.p.rapidapi.com";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

async function fetchSubredditPosts(subreddit: string, apiKey: string): Promise<RedditPost[]> {
  try {
    console.log(`Fetching posts from r/${subreddit}`);
    
    // Get hot posts from subreddit
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/getPostsBySubreddit?subreddit=${subreddit}&sort=hot&limit=20`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": RAPIDAPI_HOST
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Reddit fetch error:", response.status, errorText);
      return [];
    }
    
    const data = await response.json();
    console.log("Reddit response structure:", Object.keys(data));
    console.log("Reddit data sample:", JSON.stringify(data).slice(0, 1000));
    
    // Parse posts from response - handle multiple API response formats
    const posts: RedditPost[] = [];
    
    // Try different response structures
    let items: any[] = [];
    if (data?.data?.children && Array.isArray(data.data.children)) {
      // Standard Reddit API format
      items = data.data.children;
    } else if (data?.data && Array.isArray(data.data)) {
      // RapidAPI format: {success: true, data: [...]}
      items = data.data;
    } else if (data?.posts && Array.isArray(data.posts)) {
      items = data.posts;
    } else if (Array.isArray(data)) {
      items = data;
    }
    
    console.log(`Found ${items.length} items in response`);
    
    for (const item of items.slice(0, 15)) {
      const post = item?.data || item;
      if (!post?.title) continue;
      
      posts.push({
        title: post.title || "",
        selftext: post.selftext || post.body || post.content || "",
        score: post.score || post.ups || post.upvotes || 0,
        num_comments: post.num_comments || post.numComments || post.comments || 0,
        created_utc: post.created_utc || post.createdAt || 0,
        permalink: post.permalink || `/r/${subreddit}/comments/${post.id}` || "",
        upvote_ratio: post.upvote_ratio || 0.5
      });
    }
    
    console.log(`Found ${posts.length} posts`);
    return posts;
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    return [];
  }
}

async function fetchPostComments(permalink: string, apiKey: string): Promise<string[]> {
  try {
    // Extract post ID from permalink
    const postId = permalink.split("/comments/")[1]?.split("/")[0];
    if (!postId) return [];
    
    console.log(`Fetching comments for post: ${postId}`);
    
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/getPostComments?postId=${postId}&sort=top&limit=10`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": RAPIDAPI_HOST
        }
      }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const comments: string[] = [];
    
    const items = data?.data?.children || data?.comments || data || [];
    for (const item of items.slice(0, 10)) {
      const comment = item?.data || item;
      const body = comment?.body || comment?.text || "";
      if (body && body.length > 20) {
        comments.push(body);
      }
    }
    
    console.log(`Found ${comments.length} comments`);
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

async function analyzeWithAI(
  posts: RedditPost[],
  allComments: Map<string, string[]>,
  subredditName: string,
  apiKey: string
): Promise<AnalyzedProblem[]> {
  const postSummaries = posts.map(post => {
    const comments = allComments.get(post.permalink) || [];
    const topComments = comments.slice(0, 5).join("\n- ");
    
    return `
POST TITLE: "${post.title}"
Score: ${post.score} | Comments: ${post.num_comments}
Content: ${post.selftext?.slice(0, 500) || "N/A"}

Top Comments:
${topComments ? `- ${topComments}` : "No comments"}
---`;
  }).join("\n\n");

  const systemPrompt = `You are an expert analyst identifying career and life problems from Reddit posts.
Analyze posts from ${subredditName} to extract REAL problems people are struggling with.

CRITICAL RULES:
1. Extract problems DIRECTLY from the post content
2. Focus on recurring themes, frustrations, and questions
3. Identify underlying emotional needs, not just surface requests
4. Each problem should be actionable for a builder to solve`;

  const userPrompt = `Analyze these posts from ${subredditName} and extract 3-5 REAL problems:

${postSummaries}

Focus on: career confusion, life direction, decision paralysis, skill gaps, motivation issues.`;

  try {
    console.log("Analyzing with AI...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_problems",
            description: "Return analyzed problems from Reddit content",
            parameters: {
              type: "object",
              properties: {
                problems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      opportunityScore: { type: "number" },
                      sentiment: { type: "string", enum: ["exploding", "rising", "stable", "emerging"] },
                      category: { type: "string", enum: ["Career", "Mental Health", "Productivity", "relationships", "finance", "education"] },
                      surfaceAsk: { type: "string" },
                      realProblem: { type: "string" },
                      hiddenSignal: { type: "string" },
                      painPoints: { type: "array", items: { type: "string" } }
                    },
                    required: ["title", "description", "opportunityScore", "sentiment", "category", "surfaceAsk", "realProblem", "hiddenSignal", "painPoints"]
                  }
                }
              },
              required: ["problems"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_problems" } }
      })
    });

    if (!response.ok) {
      console.error("AI error:", response.status);
      return [];
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      console.log(`AI found ${parsed.problems?.length || 0} problems`);
      return parsed.problems || [];
    }
    
    return [];
  } catch (error) {
    console.error("AI analysis failed:", error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subredditId } = await req.json();
    
    if (!subredditId || !SUBREDDITS[subredditId as keyof typeof SUBREDDITS]) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid subreddit ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const subreddit = SUBREDDITS[subredditId as keyof typeof SUBREDDITS];
    const REDDIT_API_KEY = Deno.env.get("REDDIT_RAPIDAPI_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!REDDIT_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Reddit API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`Starting Reddit analysis for: ${subreddit.name}`);
    
    // Fetch posts
    const posts = await fetchSubredditPosts(subredditId, REDDIT_API_KEY);
    
    if (posts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [],
          message: "No posts found",
          subreddit: subreddit.name
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch comments for top posts
    const allComments = new Map<string, string[]>();
    for (const post of posts.slice(0, 5)) {
      if (post.permalink) {
        const comments = await fetchPostComments(post.permalink, REDDIT_API_KEY);
        allComments.set(post.permalink, comments);
      }
    }

    // Analyze with AI
    const problems = await analyzeWithAI(posts, allComments, subreddit.name, LOVABLE_API_KEY!);
    
    if (problems.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [],
          message: "No problems identified",
          subreddit: subreddit.name
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate total engagement
    const totalScore = posts.reduce((sum, p) => sum + p.score, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.num_comments, 0);

    // Format results
    const results = problems.map((problem, index) => ({
      id: `reddit-${subredditId}-${Date.now()}-${index}`,
      title: problem.title,
      description: problem.description,
      opportunityScore: problem.opportunityScore,
      sentiment: problem.sentiment,
      category: problem.category || subreddit.category,
      sources: [{
        name: "reddit" as const,
        sentiment: problem.sentiment,
        mentions: totalComments,
        trend: `${formatNumber(totalScore)} upvotes`
      }],
      hiddenInsight: {
        surfaceAsk: problem.surfaceAsk,
        realProblem: problem.realProblem,
        hiddenSignal: problem.hiddenSignal
      },
      painPoints: problem.painPoints,
      subredditSource: subreddit.name,
      totalScore,
      totalComments,
      isViral: totalScore > 5000
    }));

    // Save to database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    for (const result of results) {
      const { error } = await supabaseClient.from("problems").upsert({
        title: result.title,
        subtitle: result.description,
        opportunity_score: result.opportunityScore,
        sentiment: result.sentiment,
        category: result.category,
        niche: result.category.toLowerCase().replace(/\s+/g, "-"),
        sources: result.sources,
        hidden_insight: result.hiddenInsight,
        pain_points: result.painPoints,
        is_viral: result.isViral,
        slots_total: 20,
        slots_filled: 0,
        views: result.totalScore || 0,
        discovered_at: new Date().toISOString()
      }, { onConflict: "title" });
      
      if (error) console.error("Error storing problem:", error);
      else console.log(`Saved problem: ${result.title}`);
    }

    // Record scan
    await supabaseClient.from("channel_scans").upsert({
      channel_id: `reddit-${subredditId}`,
      channel_name: subreddit.name,
      last_scanned_at: new Date().toISOString(),
      videos_analyzed: posts.length,
      problems_found: results.length
    }, { onConflict: "channel_id" });

    console.log(`Analysis complete. Found ${results.length} problems from ${posts.length} posts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        postsAnalyzed: posts.length,
        subreddit: subreddit.name,
        lastScannedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Reddit search error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
