const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITEMAP_URL = "https://bbkhiwrgqilaokowhtxg.supabase.co/functions/v1/sitemap";

const PING_ENDPOINTS = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting sitemap ping to search engines...");
    
    const results = await Promise.allSettled(
      PING_ENDPOINTS.map(async (url) => {
        const response = await fetch(url, { method: "GET" });
        return {
          url,
          status: response.status,
          ok: response.ok,
        };
      })
    );

    const pingResults = results.map((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`Pinged ${PING_ENDPOINTS[index]}: ${result.value.status}`);
        return result.value;
      } else {
        console.error(`Failed to ping ${PING_ENDPOINTS[index]}:`, result.reason);
        return {
          url: PING_ENDPOINTS[index],
          status: 0,
          ok: false,
          error: result.reason?.message || "Unknown error",
        };
      }
    });

    const allSuccessful = pingResults.every((r) => r.ok);

    console.log("Sitemap ping completed:", JSON.stringify(pingResults));

    return new Response(
      JSON.stringify({
        success: allSuccessful,
        timestamp: new Date().toISOString(),
        sitemap: SITEMAP_URL,
        results: pingResults,
      }),
      {
        status: allSuccessful ? 200 : 207,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Sitemap ping error:", errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
