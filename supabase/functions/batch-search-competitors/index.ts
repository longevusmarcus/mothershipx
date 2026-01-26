/// <reference lib="deno.unstable" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function searchCompetitorsInBackground() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("[BATCH-COMPETITORS] Starting background competitor search...");

  // Get all problems
  const { data: problems, error: problemsError } = await supabase
    .from("problems")
    .select("id, title, niche, opportunity_score")
    .order("created_at", { ascending: false });

  if (problemsError) {
    console.error("[BATCH-COMPETITORS] Error fetching problems:", problemsError);
    return;
  }

  console.log(`[BATCH-COMPETITORS] Found ${problems?.length || 0} problems`);

  // Get problems that already have competitors
  const { data: existingCompetitors, error: competitorsError } = await supabase
    .from("problem_competitors")
    .select("problem_id")
    .order("problem_id");

  if (competitorsError) {
    console.error("[BATCH-COMPETITORS] Error fetching existing competitors:", competitorsError);
    return;
  }

  // Create a set of problem IDs that already have competitors
  const problemsWithCompetitors = new Set(existingCompetitors?.map((c) => c.problem_id) || []);

  // Find problems missing competitors
  const problemsMissingCompetitors = problems?.filter(
    (p) => !problemsWithCompetitors.has(p.id)
  ) || [];

  console.log(`[BATCH-COMPETITORS] Problems missing competitors: ${problemsMissingCompetitors.length}`);

  let successCount = 0;

  // Process each problem missing competitors
  for (const problem of problemsMissingCompetitors) {
    try {
      console.log(`[BATCH-COMPETITORS] Searching competitors for: ${problem.title}`);

      const response = await fetch(`${supabaseUrl}/functions/v1/search-competitors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          problemId: problem.id,
          problemTitle: problem.title,
          niche: problem.niche,
          opportunityScore: problem.opportunity_score || 50,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          `[BATCH-COMPETITORS] Success for ${problem.title}: ${result.competitors?.length || 0} competitors found`
        );
        successCount++;
      } else {
        const errorText = await response.text();
        console.error(`[BATCH-COMPETITORS] Error for ${problem.title}: ${errorText}`);
      }

      // Delay to avoid rate limiting (SERP API has limits)
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`[BATCH-COMPETITORS] Exception for ${problem.title}:`, error);
    }
  }

  console.log(`[BATCH-COMPETITORS] Complete! Successfully processed: ${successCount}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Quick check to see what's missing
    const { data: problems } = await supabase
      .from("problems")
      .select("id")
      .order("created_at", { ascending: false });

    const { data: existingCompetitors } = await supabase
      .from("problem_competitors")
      .select("problem_id");

    const problemsWithCompetitors = new Set(existingCompetitors?.map((c) => c.problem_id) || []);
    const missingCount = problems?.filter((p) => !problemsWithCompetitors.has(p.id)).length || 0;

    // Start background processing
    EdgeRuntime.waitUntil(searchCompetitorsInBackground());

    return new Response(
      JSON.stringify({
        success: true,
        message: "Background competitor search started",
        totalProblems: problems?.length || 0,
        problemsWithCompetitors: problemsWithCompetitors.size,
        problemsMissingCompetitors: missingCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[BATCH-COMPETITORS] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
