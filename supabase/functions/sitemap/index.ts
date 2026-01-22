import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://mothershipx.lovable.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch problems and challenges in parallel
    const [problemsResult, challengesResult] = await Promise.all([
      supabase.from("problems").select("id, updated_at").order("updated_at", { ascending: false }),
      supabase.from("challenges").select("id, updated_at").order("updated_at", { ascending: false }),
    ]);

    const problems = problemsResult.data || [];
    const challenges = challengesResult.data || [];

    const today = new Date().toISOString().split("T")[0];

    // Static pages
    const staticPages = [
      { loc: "/", changefreq: "daily", priority: "1.0" },
      { loc: "/problems", changefreq: "daily", priority: "0.9" },
      { loc: "/challenges", changefreq: "daily", priority: "0.9" },
      { loc: "/leaderboard", changefreq: "weekly", priority: "0.7" },
      { loc: "/auth", changefreq: "monthly", priority: "0.5" },
    ];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add problem pages
    for (const problem of problems) {
      const lastmod = problem.updated_at
        ? new Date(problem.updated_at).toISOString().split("T")[0]
        : today;
      xml += `  <url>
    <loc>${SITE_URL}/problem/${problem.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Add challenge pages
    for (const challenge of challenges) {
      const lastmod = challenge.updated_at
        ? new Date(challenge.updated_at).toISOString().split("T")[0]
        : today;
      xml += `  <url>
    <loc>${SITE_URL}/challenges/${challenge.id}/results</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
