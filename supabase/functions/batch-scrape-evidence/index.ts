/// <reference lib="deno.unstable" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function scrapeEvidenceInBackground() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("[BATCH-EVIDENCE] Starting background evidence scrape...");

  // Get all problems
  const { data: problems, error: problemsError } = await supabase
    .from("problems")
    .select("id, title, niche, category")
    .order("created_at", { ascending: false });

  if (problemsError) {
    console.error("[BATCH-EVIDENCE] Error fetching problems:", problemsError);
    return;
  }

  console.log(`[BATCH-EVIDENCE] Found ${problems?.length || 0} problems`);

  // Get problems that already have evidence
  const { data: existingEvidence, error: evidenceError } = await supabase
    .from("problem_evidence")
    .select("problem_id, source")
    .order("problem_id");

  if (evidenceError) {
    console.error("[BATCH-EVIDENCE] Error fetching existing evidence:", evidenceError);
    return;
  }

  // Create a map of problem_id -> sources that have evidence
  const evidenceMap = new Map<string, Set<string>>();
  existingEvidence?.forEach((e) => {
    if (!evidenceMap.has(e.problem_id)) {
      evidenceMap.set(e.problem_id, new Set());
    }
    evidenceMap.get(e.problem_id)!.add(e.source);
  });

  // Find problems missing TikTok or Reddit evidence
  const problemsMissingTikTok: typeof problems = [];
  const problemsMissingReddit: typeof problems = [];

  problems?.forEach((problem) => {
    const sources = evidenceMap.get(problem.id) || new Set();
    if (!sources.has("tiktok")) {
      problemsMissingTikTok.push(problem);
    }
    if (!sources.has("reddit")) {
      problemsMissingReddit.push(problem);
    }
  });

  console.log(`[BATCH-EVIDENCE] Problems missing TikTok: ${problemsMissingTikTok.length}`);
  console.log(`[BATCH-EVIDENCE] Problems missing Reddit: ${problemsMissingReddit.length}`);

  let tiktokSuccess = 0;
  let redditSuccess = 0;

  // Process TikTok evidence
  for (const problem of problemsMissingTikTok) {
    try {
      const searchQuery = `${problem.title} ${problem.niche}`.slice(0, 100);
      console.log(`[BATCH-EVIDENCE] Scraping TikTok for: ${problem.title}`);

      const response = await fetch(`${supabaseUrl}/functions/v1/scrape-problem-evidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          problemId: problem.id,
          searchQuery,
          source: "tiktok",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[BATCH-EVIDENCE] TikTok success for ${problem.title}: ${result.evidenceCount} items`);
        tiktokSuccess++;
      } else {
        console.error(`[BATCH-EVIDENCE] TikTok error for ${problem.title}`);
      }

      // Delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`[BATCH-EVIDENCE] TikTok exception for ${problem.title}:`, error);
    }
  }

  // Process Reddit evidence
  for (const problem of problemsMissingReddit) {
    try {
      const searchQuery = `${problem.title} ${problem.niche}`.slice(0, 100);
      console.log(`[BATCH-EVIDENCE] Scraping Reddit for: ${problem.title}`);

      const response = await fetch(`${supabaseUrl}/functions/v1/scrape-problem-evidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          problemId: problem.id,
          searchQuery,
          source: "reddit",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[BATCH-EVIDENCE] Reddit success for ${problem.title}: ${result.evidenceCount} items`);
        redditSuccess++;
      } else {
        console.error(`[BATCH-EVIDENCE] Reddit error for ${problem.title}`);
      }

      // Delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`[BATCH-EVIDENCE] Reddit exception for ${problem.title}:`, error);
    }
  }

  console.log(`[BATCH-EVIDENCE] Complete! TikTok: ${tiktokSuccess}, Reddit: ${redditSuccess}`);
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

    const { data: existingEvidence } = await supabase
      .from("problem_evidence")
      .select("problem_id, source");

    const evidenceMap = new Map<string, Set<string>>();
    existingEvidence?.forEach((e) => {
      if (!evidenceMap.has(e.problem_id)) {
        evidenceMap.set(e.problem_id, new Set());
      }
      evidenceMap.get(e.problem_id)!.add(e.source);
    });

    let missingTikTok = 0;
    let missingReddit = 0;
    problems?.forEach((p) => {
      const sources = evidenceMap.get(p.id) || new Set();
      if (!sources.has("tiktok")) missingTikTok++;
      if (!sources.has("reddit")) missingReddit++;
    });

    // Start background processing
    EdgeRuntime.waitUntil(scrapeEvidenceInBackground());

    return new Response(
      JSON.stringify({
        success: true,
        message: "Background evidence scraping started",
        totalProblems: problems?.length || 0,
        missingTikTok,
        missingReddit,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[BATCH-EVIDENCE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
