import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Starting batch idea generation...");

    // Get all problems that don't have any solutions
    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .select('id, title, category, niche, opportunity_score, demand_velocity, competition_gap, pain_points, sources')
      .order('opportunity_score', { ascending: false });

    if (problemsError) {
      console.error("Error fetching problems:", problemsError);
      throw problemsError;
    }

    // Get all existing solutions to know which problems already have ideas
    const { data: existingSolutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('problem_id');

    if (solutionsError) {
      console.error("Error fetching solutions:", solutionsError);
      throw solutionsError;
    }

    const problemsWithSolutions = new Set(existingSolutions?.map(s => s.problem_id) || []);
    const problemsWithoutIdeas = problems?.filter(p => !problemsWithSolutions.has(p.id)) || [];

    console.log(`Found ${problemsWithoutIdeas.length} problems without ideas`);

    // Parse request body for options
    let maxToGenerate = 50; // Default max
    let delayBetweenMs = 3000; // 3 second delay between generations
    try {
      const body = await req.json();
      if (body.maxToGenerate) maxToGenerate = Math.min(body.maxToGenerate, 100);
      if (body.delayBetweenMs) delayBetweenMs = Math.max(body.delayBetweenMs, 1000);
    } catch {
      // No body or invalid body, use defaults
    }

    const toGenerate = problemsWithoutIdeas.slice(0, maxToGenerate);
    const results: { problemId: string; problemTitle: string; success: boolean; ideaName?: string; error?: string }[] = [];

    for (const problem of toGenerate) {
      console.log(`Generating idea for: ${problem.title}`);
      
      try {
        // Call the generate-idea function
        const generateResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-idea`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            problemTitle: problem.title,
            problemCategory: problem.category,
            painPoints: problem.pain_points || [],
            niche: problem.niche,
            opportunityScore: problem.opportunity_score || 50,
            demandVelocity: problem.demand_velocity,
            competitionGap: problem.competition_gap,
            sources: problem.sources
          })
        });

        if (!generateResponse.ok) {
          const errText = await generateResponse.text();
          console.error(`Failed to generate idea for ${problem.title}:`, errText);
          results.push({ problemId: problem.id, problemTitle: problem.title, success: false, error: errText });
          
          // If rate limited, wait longer
          if (generateResponse.status === 429) {
            console.log("Rate limited, waiting 30 seconds...");
            await new Promise(r => setTimeout(r, 30000));
          }
          continue;
        }

        const { idea } = await generateResponse.json();

        // Save the idea to the database
        // We need a user_id for created_by - use a system user or the first admin
        const { data: adminUser } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
          .limit(1)
          .single();

        const createdBy = adminUser?.user_id;
        
        if (!createdBy) {
          console.error("No admin user found to create solutions");
          results.push({ problemId: problem.id, problemTitle: problem.title, success: false, error: "No admin user" });
          continue;
        }

        const { error: insertError } = await supabase
          .from('solutions')
          .insert({
            problem_id: problem.id,
            title: idea.name,
            description: idea.description,
            approach: idea.uniqueValue,
            tech_stack: idea.techStack || [],
            market_fit: idea.marketFit || 70,
            landing_page: idea.landingPage,
            created_by: createdBy,
            last_editor_id: createdBy,
            ai_generated: true
          });

        if (insertError) {
          console.error(`Failed to save idea for ${problem.title}:`, insertError);
          results.push({ problemId: problem.id, problemTitle: problem.title, success: false, error: insertError.message });
        } else {
          console.log(`Successfully created idea "${idea.name}" for "${problem.title}"`);
          results.push({ problemId: problem.id, problemTitle: problem.title, success: true, ideaName: idea.name });
        }

        // Wait between generations to avoid rate limits
        await new Promise(r => setTimeout(r, delayBetweenMs));

      } catch (error) {
        console.error(`Error generating idea for ${problem.title}:`, error);
        results.push({ 
          problemId: problem.id, 
          problemTitle: problem.title, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Batch generation complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        generated: successCount,
        failed: failCount,
        total: toGenerate.length,
        remainingWithoutIdeas: problemsWithoutIdeas.length - toGenerate.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
