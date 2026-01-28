import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TikTokVideo {
  id: string;
  webVideoUrl: string;
  coverImageUrl: string;
  desc: string;
  authorMeta: {
    name: string;
    nickName: string;
    avatar: string;
  };
  playCount: number;
  diggCount: number;
  commentCount: number;
}

const RAPIDAPI_HOST = "youtube138.p.rapidapi.com";

function parseViewCount(viewCountText: string): number {
  if (!viewCountText) return 0;
  const cleaned = viewCountText.replace(/[^0-9.KMB]/gi, '');
  const num = parseFloat(cleaned);
  if (cleaned.includes('B') || cleaned.includes('b')) return num * 1000000000;
  if (cleaned.includes('M') || cleaned.includes('m')) return num * 1000000;
  if (cleaned.includes('K') || cleaned.includes('k')) return num * 1000;
  return parseInt(viewCountText.replace(/[^0-9]/g, '')) || 0;
}

async function searchYouTubeVideos(query: string, apiKey: string): Promise<any[]> {
  try {
    console.log("[SCRAPE] Searching YouTube for:", query);
    
    const response = await fetch(`https://${RAPIDAPI_HOST}/search/?q=${encodeURIComponent(query)}&hl=en&gl=US`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SCRAPE] YouTube search error:", response.status, errorText);
      return [];
    }
    
    const data = await response.json();
    console.log("[SCRAPE] YouTube response:", JSON.stringify(data).slice(0, 500));
    
    // Extract videos from search results
    const contents = data?.contents || [];
    const videos: any[] = [];
    
    for (const item of contents) {
      const video = item?.video;
      if (!video) continue;
      
      videos.push({
        videoId: video.videoId || "",
        title: video.title || "",
        description: video.descriptionSnippet || "",
        viewCount: parseViewCount(video.stats?.views?.toString() || video.viewCountText || "0"),
        channelName: video.author?.title || video.channelName || "Unknown",
        channelThumbnail: video.author?.avatar?.[0]?.url || null,
        thumbnail: video.thumbnails?.[0]?.url || null,
        publishedAt: video.publishedTimeText || ""
      });
    }
    
    console.log(`[SCRAPE] Found ${videos.length} YouTube videos`);
    return videos.slice(0, 8); // Return up to 8 videos
  } catch (error) {
    console.error("[SCRAPE] Error searching YouTube:", error);
    return [];
  }
}

async function searchSerpVideos(query: string, apiKey: string): Promise<any[]> {
  try {
    console.log("[SCRAPE] Searching via SERP API for:", query);
    
    const response = await fetch(
      `https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(query)}&api_key=${apiKey}`,
      { method: "GET" }
    );
    
    if (!response.ok) {
      console.error("[SCRAPE] SERP API error:", response.status);
      return [];
    }
    
    const data = await response.json();
    const videoResults = data?.video_results || [];
    
    console.log(`[SCRAPE] SERP found ${videoResults.length} videos`);
    
    return videoResults.slice(0, 8).map((video: any) => ({
      videoId: video.link?.includes("watch?v=") ? video.link.split("watch?v=")[1]?.split("&")[0] : "",
      title: video.title || "",
      description: video.description || "",
      viewCount: parseViewCount(video.views?.toString() || "0"),
      channelName: video.channel?.name || "Unknown",
      channelThumbnail: video.channel?.thumbnail || null,
      thumbnail: video.thumbnail?.static || video.thumbnail || null,
      publishedAt: video.published_date || ""
    }));
  } catch (error) {
    console.error("[SCRAPE] Error with SERP API:", error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemId, searchQuery, source = "tiktok" } = await req.json();
    console.log("[SCRAPE] Request received:", { problemId, searchQuery, source });

    if (!problemId || !searchQuery) {
      return new Response(
        JSON.stringify({ error: "problemId and searchQuery are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    const youtubeApiKey = Deno.env.get("YOUTUBE_RAPIDAPI_KEY");
    const serpApiKey = Deno.env.get("SERP_API_KEY");

    console.log("[SCRAPE] API keys present - Apify:", !!apifyToken, "YouTube:", !!youtubeApiKey, "SERP:", !!serpApiKey);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let evidenceData: any[] = [];
    let actualSource = source;

    if (source === "tiktok" && apifyToken) {
      // Simplify query for TikTok - remove special chars, take first 2-3 key words
      const simplifiedQuery = searchQuery
        .replace(/[&]/g, ' ')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter((word: string) => word.length > 3)
        .slice(0, 3)
        .join(' ')
        .trim();
      
      console.log("[SCRAPE] Starting TikTok scrape with simplified query:", simplifiedQuery, "(original:", searchQuery, ")");
      
      // Use Apify TikTok scraper with searchQueries and correct searchSection value
      // Add timeout to prevent hanging - Apify sync calls can be slow
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
      
      try {
        const apifyResponse = await fetch(
          `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${apifyToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              excludePinnedPosts: false,
              searchQueries: [simplifiedQuery],
              resultsPerPage: 5,
              searchSection: "/video", // Must be "/video" with leading slash
            }),
          }
        );
        
        clearTimeout(timeoutId);

        console.log("[SCRAPE] Apify response status:", apifyResponse.status);
        
        if (apifyResponse.ok) {
          const videos = await apifyResponse.json();
          console.log("[SCRAPE] TikTok videos returned:", videos.length);
          if (videos.length > 0) {
            console.log("[SCRAPE] First video sample:", JSON.stringify(videos[0]).substring(0, 1500));
          }
          
          evidenceData = videos.slice(0, 5).map((video: any) => {
            // Try multiple possible thumbnail fields from different Apify actor versions
            const thumbnail = 
              video.videoMeta?.coverUrl ||
              video.videoMeta?.cover ||
              video.coverImageUrl ||
              video.covers?.default ||
              video.covers?.origin ||
              video.cover ||
              video.imageUrl ||
              video.thumbnailUrl ||
              video.originCover ||
              video.dynamicCover ||
              null;
            
            console.log("[SCRAPE] Video thumbnail found:", thumbnail ? "yes" : "no", thumbnail?.substring(0, 80));
            
            return {
              problem_id: problemId,
              evidence_type: "video",
              source: "tiktok",
              video_url: video.webVideoUrl || video.videoUrl || `https://www.tiktok.com/@${video.authorMeta?.name}/video/${video.id}`,
              video_thumbnail: thumbnail,
              video_title: (video.desc || video.text || "TikTok Video").substring(0, 200),
              video_author: video.authorMeta?.nickName || video.authorMeta?.name || video.author?.nickname || "Unknown",
              video_author_avatar: video.authorMeta?.avatar || video.author?.avatarThumb,
              video_views: video.playCount || video.stats?.playCount || 0,
              video_likes: video.diggCount || video.stats?.diggCount || 0,
              video_comments_count: video.commentCount || video.stats?.commentCount || 0,
              scraped_at: new Date().toISOString(),
            };
          });
        } else {
          const errorText = await apifyResponse.text();
          console.error("[SCRAPE] Apify error:", errorText);
        }
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error("[SCRAPE] TikTok API timeout after 45 seconds");
        } else {
          console.error("[SCRAPE] TikTok fetch error:", fetchError);
        }
        clearTimeout(timeoutId);
      }
    } else if (source === "reddit") {
      // Use Reddit RapidAPI - correct endpoint for reddit3 API
      const redditApiKey = Deno.env.get("REDDIT_RAPIDAPI_KEY");
      console.log("[SCRAPE] Reddit API key present:", !!redditApiKey);
      
      if (redditApiKey) {
        console.log("[SCRAPE] Starting Reddit scrape with query:", searchQuery);
        
        // Use Reddit search endpoint - time param only works with sort=top
        const redditResponse = await fetch(
          `https://reddit34.p.rapidapi.com/getSearchPosts?query=${encodeURIComponent(searchQuery)}&sort=top&time=year`,
          {
            headers: {
              "X-RapidAPI-Key": redditApiKey,
              "X-RapidAPI-Host": "reddit34.p.rapidapi.com",
            },
          }
        );

        console.log("[SCRAPE] Reddit response status:", redditResponse.status);

        if (redditResponse.ok) {
          const responseData = await redditResponse.json();
          console.log("[SCRAPE] Reddit response:", JSON.stringify(responseData).substring(0, 500));
          
          // The API returns { success: true, data: [...] } where data is the posts array
          const posts = Array.isArray(responseData.data) 
            ? responseData.data 
            : responseData.data?.posts || responseData.posts || [];
          console.log("[SCRAPE] Reddit posts count:", posts.length);
          
          if (Array.isArray(posts) && posts.length > 0) {
            evidenceData = posts.slice(0, 5).map((post: any) => {
              // Handle both nested and flat structures
              const postData = post.data || post;
              return {
                problem_id: problemId,
                evidence_type: "comment",
                source: "reddit",
                comment_text: postData.selftext?.substring(0, 500) || postData.title || postData.body,
                comment_author: postData.author || "Anonymous",
                comment_upvotes: postData.score || postData.ups || 0,
                comment_source_url: postData.permalink 
                  ? `https://reddit.com${postData.permalink}` 
                  : postData.url || "#",
                scraped_at: new Date().toISOString(),
              };
            });
          }
        } else {
          const errorText = await redditResponse.text();
          console.error("[SCRAPE] Reddit error:", errorText);
        }
      }
    } else if (source === "youtube") {
      // Direct YouTube search
      if (youtubeApiKey) {
        const videos = await searchYouTubeVideos(searchQuery, youtubeApiKey);
        
        if (videos.length > 0) {
          evidenceData = videos.map((video: any) => ({
            problem_id: problemId,
            evidence_type: "video",
            source: "youtube",
            video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
            video_thumbnail: video.thumbnail,
            video_title: video.title?.substring(0, 200) || "YouTube Video",
            video_author: video.channelName || "Unknown",
            video_author_avatar: video.channelThumbnail,
            video_views: video.viewCount || 0,
            video_likes: 0,
            video_comments_count: 0,
            scraped_at: new Date().toISOString(),
          }));
        }
      } else if (serpApiKey) {
        // Fallback to SERP API
        const videos = await searchSerpVideos(searchQuery, serpApiKey);
        
        if (videos.length > 0) {
          evidenceData = videos.map((video: any) => ({
            problem_id: problemId,
            evidence_type: "video",
            source: "youtube",
            video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
            video_thumbnail: video.thumbnail,
            video_title: video.title?.substring(0, 200) || "YouTube Video",
            video_author: video.channelName || "Unknown",
            video_author_avatar: video.channelThumbnail,
            video_views: video.viewCount || 0,
            video_likes: 0,
            video_comments_count: 0,
            scraped_at: new Date().toISOString(),
          }));
        }
      }
    }

    // FALLBACK: If TikTok/Reddit returned no results, try YouTube
    if (evidenceData.length === 0 && source !== "youtube") {
      console.log("[SCRAPE] No evidence found from", source, "- trying YouTube fallback");
      
      if (youtubeApiKey) {
        const videos = await searchYouTubeVideos(searchQuery, youtubeApiKey);
        
        if (videos.length > 0) {
          actualSource = "youtube";
          evidenceData = videos.map((video: any) => ({
            problem_id: problemId,
            evidence_type: "video",
            source: "youtube",
            video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
            video_thumbnail: video.thumbnail,
            video_title: video.title?.substring(0, 200) || "YouTube Video",
            video_author: video.channelName || "Unknown",
            video_author_avatar: video.channelThumbnail,
            video_views: video.viewCount || 0,
            video_likes: 0,
            video_comments_count: 0,
            scraped_at: new Date().toISOString(),
          }));
          console.log("[SCRAPE] YouTube fallback found", evidenceData.length, "videos");
        }
      }
      
      // If YouTube RapidAPI failed, try SERP API
      if (evidenceData.length === 0 && serpApiKey) {
        console.log("[SCRAPE] YouTube RapidAPI failed - trying SERP API fallback");
        const videos = await searchSerpVideos(searchQuery, serpApiKey);
        
        if (videos.length > 0) {
          actualSource = "youtube";
          evidenceData = videos.map((video: any) => ({
            problem_id: problemId,
            evidence_type: "video",
            source: "youtube",
            video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
            video_thumbnail: video.thumbnail,
            video_title: video.title?.substring(0, 200) || "YouTube Video",
            video_author: video.channelName || "Unknown",
            video_author_avatar: video.channelThumbnail,
            video_views: video.viewCount || 0,
            video_likes: 0,
            video_comments_count: 0,
            scraped_at: new Date().toISOString(),
          }));
          console.log("[SCRAPE] SERP API fallback found", evidenceData.length, "videos");
        }
      }
    }

    console.log("[SCRAPE] Evidence data to insert:", evidenceData.length, "from source:", actualSource);

    // Insert evidence into database
    if (evidenceData.length > 0) {
      // First, delete existing evidence for this problem/source combo to avoid duplicates
      const { error: deleteError } = await supabase
        .from("problem_evidence")
        .delete()
        .eq("problem_id", problemId)
        .eq("source", actualSource);
      
      if (deleteError) {
        console.error("[SCRAPE] Delete error:", deleteError);
      }

      // Insert new evidence
      const { error: insertError } = await supabase
        .from("problem_evidence")
        .insert(evidenceData);

      if (insertError) {
        console.error("[SCRAPE] Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to store evidence", details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("[SCRAPE] Successfully inserted evidence");
    }

    return new Response(
      JSON.stringify({
        success: true,
        evidenceCount: evidenceData.length,
        source: actualSource,
        fallbackUsed: actualSource !== source,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[SCRAPE] Error in scrape-problem-evidence:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
