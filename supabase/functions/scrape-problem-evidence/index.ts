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

interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  permalink: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemId, searchQuery, source = "tiktok" } = await req.json();

    if (!problemId || !searchQuery) {
      return new Response(
        JSON.stringify({ error: "problemId and searchQuery are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apifyToken = Deno.env.get("APIFY_API_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let evidenceData: any[] = [];

    if (source === "tiktok" && apifyToken) {
      // Use Apify TikTok scraper
      const apifyResponse = await fetch(
        `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${apifyToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            excludePinnedPosts: false,
            hashtags: [searchQuery.replace(/\s+/g, "")],
            resultsPerPage: 5,
            searchSection: "video",
          }),
        }
      );

      if (apifyResponse.ok) {
        const videos: TikTokVideo[] = await apifyResponse.json();
        
        evidenceData = videos.slice(0, 5).map((video) => ({
          problem_id: problemId,
          evidence_type: "video",
          source: "tiktok",
          video_url: video.webVideoUrl || `https://www.tiktok.com/@${video.authorMeta?.name}/video/${video.id}`,
          video_thumbnail: video.coverImageUrl,
          video_title: video.desc?.substring(0, 200) || "TikTok Video",
          video_author: video.authorMeta?.nickName || video.authorMeta?.name || "Unknown",
          video_author_avatar: video.authorMeta?.avatar,
          video_views: video.playCount || 0,
          video_likes: video.diggCount || 0,
          video_comments_count: video.commentCount || 0,
          scraped_at: new Date().toISOString(),
        }));
      }
    } else if (source === "reddit") {
      // Use Reddit RapidAPI
      const redditApiKey = Deno.env.get("REDDIT_RAPIDAPI_KEY");
      
      if (redditApiKey) {
        const redditResponse = await fetch(
          `https://reddit34.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&sort=relevance&time=year&limit=10`,
          {
            headers: {
              "X-RapidAPI-Key": redditApiKey,
              "X-RapidAPI-Host": "reddit34.p.rapidapi.com",
            },
          }
        );

        if (redditResponse.ok) {
          const data = await redditResponse.json();
          const posts = data.data?.children || [];
          
          evidenceData = posts.slice(0, 5).map((post: any) => ({
            problem_id: problemId,
            evidence_type: "comment",
            source: "reddit",
            comment_text: post.data?.selftext?.substring(0, 500) || post.data?.title,
            comment_author: post.data?.author || "Anonymous",
            comment_upvotes: post.data?.score || 0,
            comment_source_url: `https://reddit.com${post.data?.permalink}`,
            scraped_at: new Date().toISOString(),
          }));
        }
      }
    }

    // Insert evidence into database
    if (evidenceData.length > 0) {
      // First, delete existing evidence for this problem/source combo to avoid duplicates
      await supabase
        .from("problem_evidence")
        .delete()
        .eq("problem_id", problemId)
        .eq("source", source);

      // Insert new evidence
      const { error: insertError } = await supabase
        .from("problem_evidence")
        .insert(evidenceData);

      if (insertError) {
        console.error("Error inserting evidence:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to store evidence", details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
    console.error("Error in scrape-problem-evidence:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
