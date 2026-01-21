import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Channel configurations with correct YouTube channel IDs
const CHANNELS = {
  "diary-of-a-ceo": {
    id: "diary-of-a-ceo",
    name: "The Diary Of A CEO",
    handle: "@TheDiaryOfACEO",
    channelId: "UC7SeFWZYFmsm1tqWxfuOTPQ", // Correct Steven Bartlett DOAC channel ID
    category: "entrepreneurship"
  },
  "alex-hormozi": {
    id: "alex-hormozi", 
    name: "Alex Hormozi",
    handle: "@AlexHormozi",
    channelId: "UCJ5v_MCY6GNUBTO8-D3XoAg",
    category: "business"
  }
};

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  viewCount: number;
  publishedAt: string;
}

interface VideoComment {
  text: string;
  likeCount: number;
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

const RAPIDAPI_HOST = "youtube138.p.rapidapi.com";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function parseViewCount(viewCountText: string): number {
  if (!viewCountText) return 0;
  const cleaned = viewCountText.replace(/[^0-9.KMB]/gi, '');
  const num = parseFloat(cleaned);
  if (cleaned.includes('B') || cleaned.includes('b')) return num * 1000000000;
  if (cleaned.includes('M') || cleaned.includes('m')) return num * 1000000;
  if (cleaned.includes('K') || cleaned.includes('k')) return num * 1000;
  return parseInt(viewCountText.replace(/[^0-9]/g, '')) || 0;
}

async function fetchChannelVideos(channelId: string, apiKey: string): Promise<YouTubeVideo[]> {
  try {
    console.log(`Fetching videos for channel: ${channelId}`);
    
    const response = await fetch(`https://${RAPIDAPI_HOST}/channel/videos/`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: channelId,
        filter: "videos_latest",
        cursor: "",
        hl: "en",
        gl: "US"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Channel videos fetch error:", response.status, errorText);
      return [];
    }
    
    const data = await response.json();
    console.log("Channel videos response:", JSON.stringify(data).slice(0, 500));
    
    // Extract videos from the response
    const contents = data?.contents || [];
    const videos: YouTubeVideo[] = [];
    
    for (const item of contents.slice(0, 5)) {
      const video = item?.video;
      if (!video) continue;
      
      videos.push({
        videoId: video.videoId || "",
        title: video.title || "",
        description: video.descriptionSnippet || "",
        viewCount: parseViewCount(video.stats?.views?.toString() || video.viewCountText || "0"),
        publishedAt: video.publishedTimeText || ""
      });
    }
    
    console.log(`Found ${videos.length} videos`);
    return videos;
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return [];
  }
}

async function fetchVideoComments(videoId: string, apiKey: string): Promise<VideoComment[]> {
  try {
    console.log(`Fetching comments for video: ${videoId}`);
    
    // Use the correct endpoint for video comments
    const response = await fetch(`https://${RAPIDAPI_HOST}/video/comments/?id=${videoId}&hl=en&gl=US`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Comments fetch error:", response.status, errorText);
      return [];
    }
    
    const data = await response.json();
    const comments: VideoComment[] = [];
    
    // Handle different response structures
    const commentItems = data?.comments || data?.contents || [];
    for (const item of commentItems.slice(0, 30)) {
      const comment = item?.comment || item;
      comments.push({
        text: comment?.content || comment?.text || comment?.snippet?.textDisplay || "",
        likeCount: parseInt(comment?.likes || comment?.likeCount || comment?.snippet?.likeCount || "0") || 0
      });
    }
    
    console.log(`Found ${comments.length} comments for video ${videoId}`);
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

async function fetchVideoDetails(videoId: string, apiKey: string): Promise<{ description: string; title: string }> {
  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/video/details/`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: videoId,
        hl: "en",
        gl: "US"
      })
    });
    
    if (!response.ok) {
      await response.text();
      return { description: "", title: "" };
    }
    
    const data = await response.json();
    return {
      description: data?.description || "",
      title: data?.title || ""
    };
  } catch {
    return { description: "", title: "" };
  }
}

async function analyzeWithAI(
  videos: YouTubeVideo[],
  allComments: Map<string, VideoComment[]>,
  channelName: string,
  apiKey: string
): Promise<AnalyzedProblem[]> {
  const videoSummaries = videos.map(video => {
    const comments = allComments.get(video.videoId) || [];
    const topComments = comments
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 15)
      .map(c => c.text)
      .filter(c => c.length > 10) // Filter out very short comments
      .join("\n- ");
    
    return `
VIDEO TITLE: "${video.title}"
Views: ${formatNumber(video.viewCount)}
Published: ${video.publishedAt}
Description: ${video.description || "N/A"}

Top Comments (if available):
${topComments ? `- ${topComments}` : "No comments available"}
---`;
  }).join("\n\n");

  const systemPrompt = `You are an expert business analyst specializing in identifying market opportunities from YouTube content.
You MUST analyze the ACTUAL video titles, descriptions, and comments provided below from "${channelName}".

CRITICAL RULES:
1. Extract problems/opportunities DIRECTLY from the video content provided
2. DO NOT invent generic business problems unrelated to the videos
3. Each problem MUST reference specific topics from the video titles
4. Focus on what the audience is discussing, asking, or struggling with

Categories to identify:
- Confusion points from comments
- Complaints about existing solutions
- Unmet needs expressed by viewers
- Repeated questions or pain points`;

  const userPrompt = `Here are the 5 most recent videos from "${channelName}" - analyze them to extract 3-5 REAL business problems/opportunities DIRECTLY related to the content:

${videoSummaries}

IMPORTANT: Your analysis MUST be based on the actual video topics above. Extract problems that relate to the specific themes discussed in these videos.`;

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
            description: "Return analyzed problems from YouTube content",
            parameters: {
              type: "object",
              properties: {
                problems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Clear, concise problem title based on video content" },
                      description: { type: "string", description: "2-3 sentence description of the problem" },
                      opportunityScore: { type: "number", description: "Score 1-100 based on market opportunity" },
                      sentiment: { type: "string", enum: ["exploding", "rising", "stable", "emerging"] },
                      category: { type: "string", enum: ["entrepreneurship", "business", "marketing", "sales", "mindset", "health", "relationships", "finance", "productivity", "leadership"], description: "Best category for this problem" },
                      surfaceAsk: { type: "string", description: "What people literally ask for" },
                      realProblem: { type: "string", description: "The actual underlying problem" },
                      hiddenSignal: { type: "string", description: "Deeper insight about unmet needs" },
                      painPoints: { type: "array", items: { type: "string" }, description: "3-5 specific pain points" }
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
      const errorText = await response.text();
      console.error("AI analysis error:", response.status, errorText);
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
    const { channelId } = await req.json();
    
    if (!channelId || !CHANNELS[channelId as keyof typeof CHANNELS]) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid channel ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const channel = CHANNELS[channelId as keyof typeof CHANNELS];
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_RAPIDAPI_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "YouTube API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Lovable API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`Starting YouTube analysis for: ${channel.name} (${channel.channelId})`);
    
    // Fetch 5 most recent videos
    const videos = await fetchChannelVideos(channel.channelId, YOUTUBE_API_KEY);
    
    if (videos.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [],
          message: "No videos found for this channel",
          channel: channel.name
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch comments for each video
    const allComments = new Map<string, VideoComment[]>();
    for (const video of videos) {
      const comments = await fetchVideoComments(video.videoId, YOUTUBE_API_KEY);
      allComments.set(video.videoId, comments);
    }

    // Analyze with AI
    const problems = await analyzeWithAI(videos, allComments, channel.name, LOVABLE_API_KEY);
    
    if (problems.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [],
          message: "No problems identified from content analysis",
          channel: channel.name,
          videosAnalyzed: videos.length
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format results - use AI-detected category for each problem
    const results = problems.map((problem, index) => {
      const sourceVideo = videos[index] || videos[0];
      return {
        id: `yt-${channelId}-${Date.now()}-${index}`,
        title: problem.title,
        description: problem.description,
        opportunityScore: problem.opportunityScore,
        sentiment: problem.sentiment,
        category: problem.category || channel.category, // Use AI category, fallback to channel
        sources: [{
          name: "youtube" as const,
          sentiment: problem.sentiment,
          mentions: allComments.get(sourceVideo?.videoId)?.length || 0,
          trend: `${formatNumber(sourceVideo?.viewCount || 0)} views`
        }],
        hiddenInsight: {
          surfaceAsk: problem.surfaceAsk,
          realProblem: problem.realProblem,
          hiddenSignal: problem.hiddenSignal
        },
        painPoints: problem.painPoints,
        videoSource: sourceVideo?.title || "",
        viewCount: sourceVideo?.viewCount || 0,
        channelName: channel.name,
        isViral: (sourceVideo?.viewCount || 0) > 500000
      };
    });

    // Store viral results in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Save ALL YouTube results to database (not just viral)
    for (const result of results) {
      const { error } = await supabase.from("problems").upsert({
        title: result.title,
        subtitle: result.description, // Use subtitle, not description
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
        views: result.viewCount || 0,
        discovered_at: new Date().toISOString()
      }, { onConflict: "title" });
      
      if (error) console.error("Error storing problem:", error);
      else console.log(`Saved problem to library: ${result.title}`);
    }

    console.log(`Analysis complete. Found ${results.length} problems from ${videos.length} videos`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        videosAnalyzed: videos.length,
        channel: channel.name
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("YouTube search error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
