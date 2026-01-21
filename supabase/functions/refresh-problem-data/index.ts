import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendSignal {
  source: string;
  metric: string;
  value: string;
  change: number;
  icon?: string;
}

function formatValue(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function generateFreshSources(views: number, demandVelocity: number, competitionGap: number): TrendSignal[] {
  // Add some randomness to simulate real-time data changes
  const viewVariation = Math.round(views * (0.95 + Math.random() * 0.1));
  const demandVariation = Math.round(demandVelocity + (Math.random() * 10 - 5));
  const gapVariation = Math.round(competitionGap + (Math.random() * 8 - 4));
  
  return [
    { 
      source: "tiktok", 
      metric: "Views", 
      value: formatValue(viewVariation), 
      change: Math.round(demandVariation * 0.8 + Math.random() * 15), 
      icon: "📱" 
    },
    { 
      source: "google_trends", 
      metric: "Search Interest", 
      value: `${Math.min(99, Math.max(20, demandVariation))}/100`, 
      change: Math.round(demandVariation * 0.5 + Math.random() * 10), 
      icon: "📈" 
    },
    { 
      source: "reddit", 
      metric: "Mentions", 
      value: `${Math.round(viewVariation / 200)}+`, 
      change: Math.round(gapVariation * 0.6 + Math.random() * 8), 
      icon: "💬" 
    },
  ];
}

function generateHiddenInsight(title: string, category: string, painPoints: string[]): object {
  // Generate contextual hidden insights based on problem data
  const surfaceTemplates = [
    `How do I solve ${category.toLowerCase()} issues?`,
    `What's the best ${category.toLowerCase()} solution?`,
    `I need help with ${painPoints[0]?.toLowerCase() || category.toLowerCase()}`,
  ];
  
  const realProblemTemplates = [
    `Users feel overwhelmed by existing solutions and want simplicity`,
    `The emotional burden of ${category.toLowerCase()} is underestimated`,
    `People seek validation, not just solutions`,
  ];
  
  const hiddenSignalTemplates = [
    `Market gap exists for human-centered ${category.toLowerCase()} approaches`,
    `Community-driven solutions outperform solo tools`,
    `Simplification is the new premium feature`,
  ];
  
  return {
    surfaceAsk: surfaceTemplates[Math.floor(Math.random() * surfaceTemplates.length)],
    realProblem: realProblemTemplates[Math.floor(Math.random() * realProblemTemplates.length)],
    hiddenSignal: hiddenSignalTemplates[Math.floor(Math.random() * hiddenSignalTemplates.length)],
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let problemId: string | null = null;
    let updateAll = false;

    // Check if request has a body
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const body = await req.json();
        problemId = body.problemId || null;
        updateAll = body.updateAll || false;
      } catch {
        // No body or invalid JSON, update all
        updateAll = true;
      }
    } else {
      updateAll = true;
    }

    let query = supabase.from('problems').select('*');
    
    if (problemId) {
      query = query.eq('id', problemId);
    }
    
    const { data: problems, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error(`Failed to fetch problems: ${fetchError.message}`);
    }

    if (!problems || problems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No problems to update', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating ${problems.length} problem(s)...`);

    let updatedCount = 0;
    
    for (const problem of problems) {
      const views = problem.views || 100000;
      const shares = problem.shares || 0;
      
      // Calculate demand velocity if missing or needs refresh
      // Base on views, shares, and opportunity score
      let demandVelocity = problem.demand_velocity;
      if (!demandVelocity || demandVelocity === 0) {
        const viewScore = Math.log10(Math.max(1, views)) * 10;
        const shareBonus = Math.min(20, shares / 100);
        demandVelocity = Math.min(200, Math.max(30, Math.round(
          40 + viewScore + shareBonus + (problem.opportunity_score * 0.4) + Math.random() * 25
        )));
      } else {
        // Add small daily variation (+/- 5%)
        demandVelocity = Math.min(200, Math.max(20, Math.round(
          demandVelocity * (0.95 + Math.random() * 0.1)
        )));
      }
      
      // Calculate competition gap if missing or needs refresh
      let competitionGap = problem.competition_gap;
      if (!competitionGap || competitionGap === 0) {
        const sentimentBonus = problem.sentiment === 'exploding' ? 20 : problem.sentiment === 'rising' ? 10 : 0;
        competitionGap = Math.min(95, Math.max(40, Math.round(
          45 + sentimentBonus + (problem.opportunity_score * 0.3) + Math.random() * 15
        )));
      } else {
        // Add small daily variation (+/- 3%)
        competitionGap = Math.min(95, Math.max(30, Math.round(
          competitionGap * (0.97 + Math.random() * 0.06)
        )));
      }
      
      // Generate fresh sources based on updated metrics
      const freshSources = generateFreshSources(views, demandVelocity, competitionGap);
      
      // Generate or update hidden insight if missing
      let hiddenInsight = problem.hidden_insight;
      if (!hiddenInsight || !hiddenInsight.surfaceAsk) {
        hiddenInsight = generateHiddenInsight(
          problem.title, 
          problem.category, 
          problem.pain_points || []
        );
      }
      
      // Update the problem with fresh metrics
      const { error: updateError } = await supabase
        .from('problems')
        .update({
          demand_velocity: demandVelocity,
          competition_gap: competitionGap,
          sources: freshSources,
          hidden_insight: hiddenInsight,
          updated_at: new Date().toISOString(),
        })
        .eq('id', problem.id);

      if (updateError) {
        console.error(`Error updating problem ${problem.id}:`, updateError);
      } else {
        updatedCount++;
        console.log(`Updated: ${problem.title} (demand: ${demandVelocity}%, gap: ${competitionGap}%)`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedCount} problem(s)`,
        updated: updatedCount,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Refresh error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
