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

    console.log("[SCRAPE] Apify token present:", !!apifyToken);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let evidenceData: any[] = [];

    if (source === "tiktok" && apifyToken) {
      console.log("[SCRAPE] Starting TikTok scrape with query:", searchQuery);
      
      // Use Apify TikTok scraper with searchQueries and correct searchSection value
      const apifyResponse = await fetch(
        `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${apifyToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            excludePinnedPosts: false,
            searchQueries: [searchQuery],
            resultsPerPage: 5,
            searchSection: "/video", // Must be "/video" with leading slash
          }),
        }
      );

      console.log("[SCRAPE] Apify response status:", apifyResponse.status);
      
      if (apifyResponse.ok) {
        const videos = await apifyResponse.json();
        console.log("[SCRAPE] TikTok videos returned:", videos.length);
        if (videos.length > 0) {
          console.log("[SCRAPE] First video keys:", Object.keys(videos[0]));
        }
        
        evidenceData = videos.slice(0, 5).map((video: any) => ({
          problem_id: problemId,
          evidence_type: "video",
          source: "tiktok",
          video_url: video.webVideoUrl || video.videoUrl || `https://www.tiktok.com/@${video.authorMeta?.name}/video/${video.id}`,
          video_thumbnail: video.coverImageUrl || video.covers?.default || video.videoMeta?.coverUrl || video.cover,
          video_title: (video.desc || video.text || "TikTok Video").substring(0, 200),
          video_author: video.authorMeta?.nickName || video.authorMeta?.name || video.author?.nickname || "Unknown",
          video_author_avatar: video.authorMeta?.avatar || video.author?.avatarThumb,
          video_views: video.playCount || video.stats?.playCount || 0,
          video_likes: video.diggCount || video.stats?.diggCount || 0,
          video_comments_count: video.commentCount || video.stats?.commentCount || 0,
          scraped_at: new Date().toISOString(),
        }));
      } else {
        const errorText = await apifyResponse.text();
        console.error("[SCRAPE] Apify error:", errorText);
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
    }

    console.log("[SCRAPE] Evidence data to insert:", evidenceData.length);

    // Insert evidence into database
    if (evidenceData.length > 0) {
      // First, delete existing evidence for this problem/source combo to avoid duplicates
      const { error: deleteError } = await supabase
        .from("problem_evidence")
        .delete()
        .eq("problem_id", problemId)
        .eq("source", source);
      
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
        source,
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
