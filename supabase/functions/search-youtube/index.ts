import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Channel configurations
const CHANNELS = {
  "diary-of-a-ceo": {
    id: "diary-of-a-ceo",
    name: "The Diary Of A CEO",
    handle: "@TheDiaryOfACEO",
    channelId: "UCGq7ov9-Xk9fkeQjeeXElkQ",
    category: "entrepreneurship"
  },
  "alex-hormozi": {
    id: "alex-hormozi", 
    name: "Alex Hormozi",
    handle: "@AlexHormozi",
    channelId: "UCo57N6y0cBI-mPhCjsGkHvg",
    category: "business"
  }
};

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  channelTitle: string;
}

interface VideoComment {
  text: string;
  likeCount: number;
  authorDisplayName: string;
}

interface AnalyzedProblem {
  title: string;
  description: string;
  opportunityScore: number;
  sentiment: string;
  surfaceAsk: string;
  realProblem: string;
  hiddenSignal: string;
  painPoints: string[];
  videoSource: string;
  viewCount: number;
  commentCount: number;
}

// Minimum thresholds for video filtering
const MIN_VIEW_COUNT = 50000;
const MIN_COMMENT_COUNT = 100;
const MAX_VIDEO_AGE_DAYS = 180; // 6 months

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

async function fetchChannelVideos(channelId: string, apiKey: string): Promise<YouTubeVideo[]> {
  const rapidApiHost = "youtube-v31.p.rapidapi.com";
  
  try {
    // Get channel's upload playlist
    const channelUrl = `https://${rapidApiHost}/channels?part=contentDetails&id=${channelId}`;
    const channelResponse = await fetch(channelUrl, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": rapidApiHost
      }
    });
    
    if (!channelResponse.ok) {
      console.error("Channel fetch error:", await channelResponse.text());
      return [];
    }
    
    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      console.error("No uploads playlist found for channel:", channelId);
      return [];
    }
    
    // Get videos from playlist
    const playlistUrl = `https://${rapidApiHost}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=20`;
    const playlistResponse = await fetch(playlistUrl, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": rapidApiHost
      }
    });
    
    if (!playlistResponse.ok) {
      console.error("Playlist fetch error:", await playlistResponse.text());
      return [];
    }
    
    const playlistData = await playlistResponse.json();
    const videoIds = playlistData.items?.map((item: any) => item.snippet?.resourceId?.videoId).filter(Boolean);
    
    if (!videoIds || videoIds.length === 0) return [];
    
    // Get video details with statistics
    const videosUrl = `https://${rapidApiHost}/videos?part=snippet,statistics&id=${videoIds.join(",")}`;
    const videosResponse = await fetch(videosUrl, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": rapidApiHost
      }
    });
    
    if (!videosResponse.ok) {
      console.error("Videos fetch error:", await videosResponse.text());
      return [];
    }
    
    const videosData = await videosResponse.json();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_VIDEO_AGE_DAYS);
    
    const videos: YouTubeVideo[] = (videosData.items || [])
      .map((video: any) => ({
        videoId: video.id,
        title: video.snippet?.title || "",
        description: video.snippet?.description || "",
        viewCount: parseInt(video.statistics?.viewCount || "0"),
        likeCount: parseInt(video.statistics?.likeCount || "0"),
        commentCount: parseInt(video.statistics?.commentCount || "0"),
        publishedAt: video.snippet?.publishedAt || "",
        channelTitle: video.snippet?.channelTitle || ""
      }))
      .filter((v: YouTubeVideo) => {
        const videoDate = new Date(v.publishedAt);
        return v.viewCount >= MIN_VIEW_COUNT && 
               v.commentCount >= MIN_COMMENT_COUNT &&
               videoDate >= cutoffDate;
      });
    
    return videos;
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return [];
  }
}

async function fetchVideoComments(videoId: string, apiKey: string): Promise<VideoComment[]> {
  const rapidApiHost = "youtube-v31.p.rapidapi.com";
  
  try {
    const url = `https://${rapidApiHost}/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&order=relevance`;
    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": rapidApiHost
      }
    });
    
    if (!response.ok) {
      console.error("Comments fetch error:", await response.text());
      return [];
    }
    
    const data = await response.json();
    
    return (data.items || []).map((item: any) => ({
      text: item.snippet?.topLevelComment?.snippet?.textDisplay || "",
      likeCount: item.snippet?.topLevelComment?.snippet?.likeCount || 0,
      authorDisplayName: item.snippet?.topLevelComment?.snippet?.authorDisplayName || ""
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

async function fetchVideoTranscript(videoId: string, apiKey: string): Promise<string> {
  const rapidApiHost = "youtube-v31.p.rapidapi.com";
  
  try {
    // Try to get captions - this endpoint may not always work
    const url = `https://${rapidApiHost}/captions?part=snippet&videoId=${videoId}`;
    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": rapidApiHost
      }
    });
    
    if (!response.ok) {
      // Transcripts may not be available, return empty
      await response.text();
      return "";
    }
    
    const data = await response.json();
    // Note: Full transcript download requires additional API calls
    // For now, we'll rely on video description and comments for analysis
    return data.items?.[0]?.snippet?.name || "";
  } catch {
    return "";
  }
}

async function analyzeWithAI(
  videos: YouTubeVideo[],
  allComments: Map<string, VideoComment[]>,
  channelName: string,
  apiKey: string
): Promise<AnalyzedProblem[]> {
  const videoSummaries = videos.slice(0, 5).map(video => {
    const comments = allComments.get(video.videoId) || [];
    const topComments = comments
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 10)
      .map(c => c.text)
      .join("\n");
    
    return `
VIDEO: ${video.title}
Views: ${formatNumber(video.viewCount)}, Comments: ${formatNumber(video.commentCount)}
Description: ${video.description.slice(0, 500)}
Top Comments:
${topComments}
---`;
  }).join("\n\n");

  const systemPrompt = `You are an expert at analyzing YouTube content to identify business opportunities and unmet needs. 
Analyze the following videos and comments from the channel "${channelName}" to find:
1. Confusion points - where viewers are confused or ask for clarification
2. Complaints - frustrations with current solutions
3. Unmet needs - things people want but can't find
4. Repeated questions - common problems many people share

Focus on extracting REAL, actionable business problems that could be solved with a product or service.`;

  const userPrompt = `Analyze these videos and their comments to identify 3-5 distinct business problems or opportunities:

${videoSummaries}

For each problem, identify the surface-level ask, the real underlying problem, and any hidden signals about deeper needs.`;

  try {
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
                      title: { type: "string", description: "Clear, concise problem title" },
                      description: { type: "string", description: "2-3 sentence description of the problem" },
                      opportunityScore: { type: "number", description: "Score 1-100 based on market opportunity" },
                      sentiment: { type: "string", enum: ["exploding", "rising", "stable", "emerging"] },
                      surfaceAsk: { type: "string", description: "What people literally ask for" },
                      realProblem: { type: "string", description: "The actual underlying problem" },
                      hiddenSignal: { type: "string", description: "Deeper insight about unmet needs" },
                      painPoints: { type: "array", items: { type: "string" }, description: "3-5 specific pain points" }
                    },
                    required: ["title", "description", "opportunityScore", "sentiment", "surfaceAsk", "realProblem", "hiddenSignal", "painPoints"]
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
      console.error("AI analysis error:", await response.text());
      return [];
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
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

    console.log(`Fetching videos for channel: ${channel.name}`);
    
    // Fetch videos from the channel
    const videos = await fetchChannelVideos(channel.channelId, YOUTUBE_API_KEY);
    console.log(`Found ${videos.length} qualifying videos`);
    
    if (videos.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [],
          message: "No recent videos matching criteria found"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch comments for top videos
    const allComments = new Map<string, VideoComment[]>();
    for (const video of videos.slice(0, 5)) {
      const comments = await fetchVideoComments(video.videoId, YOUTUBE_API_KEY);
      allComments.set(video.videoId, comments);
    }

    console.log("Analyzing content with AI...");
    
    // Analyze with AI
    const problems = await analyzeWithAI(videos, allComments, channel.name, LOVABLE_API_KEY);
    
    // Format results similar to TikTok search results
    const results = problems.map((problem, index) => {
      const sourceVideo = videos[index] || videos[0];
      return {
        id: `yt-${channelId}-${Date.now()}-${index}`,
        title: problem.title,
        description: problem.description,
        opportunityScore: problem.opportunityScore,
        sentiment: problem.sentiment,
        category: channel.category,
        sources: [{
          name: "youtube" as const,
          sentiment: problem.sentiment,
          mentions: sourceVideo?.commentCount || 0,
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

    for (const result of results.filter(r => r.isViral)) {
      const { error } = await supabase.from("problems").upsert({
        title: result.title,
        description: result.description,
        opportunity_score: result.opportunityScore,
        sentiment: result.sentiment,
        category: result.category,
        sources: result.sources,
        hidden_insight: result.hiddenInsight,
        pain_points: result.painPoints,
        is_viral: true,
        slots_filled: 0,
        builders_needed: 3
      }, { onConflict: "title" });
      
      if (error) console.error("Error storing problem:", error);
    }

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
