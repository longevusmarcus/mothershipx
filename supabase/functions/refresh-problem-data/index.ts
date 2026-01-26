import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { refreshProblemSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

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

function generateFreshSources(views: number, shares: number, demandVelocity: number, competitionGap: number, existingSources: any[]): TrendSignal[] {
  // Check if this is a Reddit-only problem (has 'name' key = 'reddit' or only reddit sources)
  const isRedditOnly = existingSources?.some((s: any) => s.name === 'reddit') ||
    (existingSources?.length === 1 && existingSources[0]?.source === 'reddit');
  
  if (isRedditOnly) {
    // Preserve Reddit-only format with fresh variation
    const upvoteVariation = Math.round(views * (0.95 + Math.random() * 0.1));
    const commentVariation = Math.round(shares * (0.95 + Math.random() * 0.1));
    
    return [
      {
        source: "reddit",
        name: "reddit",
        trend: `${upvoteVariation} upvotes`,
        mentions: commentVariation,
      } as any
    ];
  }
  
  // Standard TikTok/Google Trends/Reddit format for non-Reddit-only problems
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

async function generateHiddenInsightWithAI(title: string, category: string, painPoints: string[]): Promise<object> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.log("No LOVABLE_API_KEY, using fallback hidden insight generation");
    return generateFallbackHiddenInsight(title, category, painPoints);
  }
  
  try {
    const prompt = `Analyze this market problem and provide hidden insights:

Problem: "${title}"
Category: ${category}
Pain Points: ${painPoints.join(', ') || 'Not specified'}

Generate a hidden signal analysis with exactly 3 parts:
1. surfaceAsk: What users literally say they want (a realistic quote, 10-20 words)
2. realProblem: The deeper unspoken need behind their ask (15-25 words)  
3. hiddenSignal: A strategic insight for builders - an opportunity others miss (15-30 words)

Be specific to this exact problem. Avoid generic statements. Focus on unique market dynamics.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a market research analyst specializing in identifying hidden customer needs and market opportunities. Always return valid JSON." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_hidden_insight",
            description: "Create a hidden insight analysis for a market problem",
            parameters: {
              type: "object",
              properties: {
                surfaceAsk: { type: "string", description: "What users literally say they want - a realistic user quote" },
                realProblem: { type: "string", description: "The deeper unspoken need behind their ask" },
                hiddenSignal: { type: "string", description: "A strategic insight for builders - an opportunity others miss" }
              },
              required: ["surfaceAsk", "realProblem", "hiddenSignal"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_hidden_insight" } }
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return generateFallbackHiddenInsight(title, category, painPoints);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const insight = JSON.parse(toolCall.function.arguments);
      console.log(`Generated AI hidden insight for: ${title}`);
      return insight;
    }
    
    return generateFallbackHiddenInsight(title, category, painPoints);
  } catch (error) {
    console.error("Error generating AI hidden insight:", error);
    return generateFallbackHiddenInsight(title, category, painPoints);
  }
}

function generateFallbackHiddenInsight(title: string, category: string, painPoints: string[]): object {
  // Fallback with more unique, problem-specific text
  const mainPain = painPoints[0] || "this challenge";
  
  return {
    surfaceAsk: `I just need a simple way to handle ${mainPain.toLowerCase()}`,
    realProblem: `${category} users are exhausted by complex tools and want solutions that respect their time and mental energy`,
    hiddenSignal: `Winners in this space will focus on reducing cognitive load, not adding features. The ${category.toLowerCase()} market rewards simplicity.`,
  };
}

// Generate AI solution suggestions based on problem context
function generateSolutionSuggestions(problem: {
  id: string;
  title: string;
  category: string;
  pain_points: string[] | null;
  opportunity_score: number;
}): { title: string; description: string; approach: string; tech_stack: string[]; market_fit: number }[] {
  const painPoints = problem.pain_points || [];
  const mainPainPoint = painPoints[0] || "core user challenge";
  const secondPainPoint = painPoints[1] || "efficiency needs";
  const category = problem.category.toLowerCase();
  const title = problem.title;
  
  const isBusiness = category.includes("business") || category.includes("entrepreneur") || title.toLowerCase().includes("startup") || title.toLowerCase().includes("saas");
  const isProductivity = category.includes("productivity");
  const isHealth = category.includes("health") || category.includes("mental") || category.includes("fitness");
  
  if (isBusiness) {
    return [
      {
        title: "AI-Powered Revenue Intelligence",
        description: `Predict revenue outcomes and identify growth levers. Tackles "${mainPainPoint}" with ML-driven insights and automated reporting.`,
        approach: `**Phase 1 - Data Integration** (Week 1-2)\n• Connect billing, CRM, and analytics\n• Build revenue forecasting models\n• Identify churn risk signals\n\n**Phase 2 - Intelligence** (Week 3-4)\n• Cohort analysis automation\n• Pricing optimization suggestions\n• "${secondPainPoint}" - competitor benchmarking\n\n**Phase 3 - Action** (Week 5+)\n• Automated playbooks for growth\n• A/B test recommendations\n• ROI tracking dashboard`,
        tech_stack: ["Python", "FastAPI", "PostgreSQL", "React", "Stripe API"],
        market_fit: Math.min(94, problem.opportunity_score + Math.floor(Math.random() * 8)),
      },
      {
        title: "Customer Success Automation Hub",
        description: `Turn reactive support into proactive success. Addresses "${secondPainPoint}" by predicting customer needs before they ask.`,
        approach: `**Core Features**\n• Health score tracking across touchpoints\n• Automated check-in triggers\n• Expansion opportunity alerts\n\n**Intelligence**\n• NLP analysis of support tickets\n• Usage pattern anomaly detection\n• "${mainPainPoint}" - early warning system\n\n**Team Tools**\n• CSM workload balancing\n• Playbook recommendations\n• Impact attribution`,
        tech_stack: ["Next.js", "Supabase", "OpenAI", "Intercom API"],
        market_fit: Math.min(90, problem.opportunity_score + Math.floor(Math.random() * 6)),
      },
      {
        title: "Startup Metrics Command Center",
        description: `One dashboard for founder-critical metrics. Solves "${mainPainPoint}" with real-time visibility into what actually matters.`,
        approach: `**Key Metrics**\n• MRR, ARR, and growth rate\n• CAC/LTV by acquisition channel\n• Runway and burn rate\n\n**Automation**\n• Weekly investor update generator\n• Board deck auto-population\n• "${secondPainPoint}" - anomaly alerts\n\n**Monetization**\n• Free for early-stage\n• $99/mo for growth stage\n• Enterprise custom pricing`,
        tech_stack: ["React", "Supabase", "Stripe", "Plaid", "ChartJS"],
        market_fit: Math.min(86, problem.opportunity_score + Math.floor(Math.random() * 5)),
      },
    ];
  } else if (isProductivity) {
    return [
      {
        title: "Deep Work Session Manager",
        description: `Protect focus time with intelligent scheduling. Tackles "${mainPainPoint}" by blocking distractions and optimizing your calendar.`,
        approach: `**Smart Blocking**\n• Learn your focus patterns\n• Auto-decline meeting conflicts\n• "${secondPainPoint}" - sync across all devices\n\n**Integration**\n• Slack/Teams status sync\n• Calendar optimization\n• Distraction analytics\n\n**Premium**\n• Team focus coordination\n• Manager visibility tools`,
        tech_stack: ["Electron", "React", "Google Calendar API", "Supabase"],
        market_fit: Math.min(92, problem.opportunity_score + Math.floor(Math.random() * 7)),
      },
      {
        title: "Context Switching Defender",
        description: `Reduce cognitive load from task switching. Addresses "${secondPainPoint}" with smart context preservation and quick-resume features.`,
        approach: `**Core Features**\n• Capture context before switching\n• Instant context restoration\n• "${mainPainPoint}" - browser tab management\n\n**Analytics**\n• Context switch frequency tracking\n• Cost of interruptions calculated\n• Focus improvement trends`,
        tech_stack: ["Chrome Extension", "React", "Supabase"],
        market_fit: Math.min(88, problem.opportunity_score + Math.floor(Math.random() * 6)),
      },
      {
        title: "Energy-Based Task Scheduler",
        description: `Match tasks to your energy levels. Solves "${mainPainPoint}" by scheduling hard work when you're at peak capacity.`,
        approach: `**Energy Tracking**\n• Quick daily energy check-ins\n• Learn your biological patterns\n• Predict low-energy windows\n\n**Smart Scheduling**\n• Auto-suggest task timing\n• Meeting optimization\n• "${secondPainPoint}" - recovery time blocks`,
        tech_stack: ["React Native", "Supabase", "HealthKit", "OpenAI"],
        market_fit: Math.min(85, problem.opportunity_score + Math.floor(Math.random() * 5)),
      },
    ];
  } else if (isHealth) {
    return [
      {
        title: "Personalized Wellness Coach",
        description: `AI companion that adapts to your unique health journey. Tackles "${mainPainPoint}" with empathetic, science-backed guidance.`,
        approach: `**Personalization**\n• Comprehensive health profile\n• Daily adaptive recommendations\n• "${secondPainPoint}" - progress celebration\n\n**Features**\n• Voice-based check-ins\n• Mood and energy correlation\n• Provider-friendly reports`,
        tech_stack: ["React Native", "Supabase", "OpenAI", "HealthKit"],
        market_fit: Math.min(93, problem.opportunity_score + Math.floor(Math.random() * 7)),
      },
      {
        title: "Habit Stacking Assistant",
        description: `Build lasting habits by connecting them to existing routines. Addresses "${secondPainPoint}" with behavioral science techniques.`,
        approach: `**Habit Engine**\n• Identify existing routine anchors\n• Suggest habit stack opportunities\n• "${mainPainPoint}" - no guilt tracking\n\n**Motivation**\n• Streak mechanics that forgive\n• Community accountability\n• Celebrating small wins`,
        tech_stack: ["React Native", "Supabase", "Push Notifications"],
        market_fit: Math.min(89, problem.opportunity_score + Math.floor(Math.random() * 6)),
      },
      {
        title: "Sleep Optimization System",
        description: `Data-driven sleep improvement without expensive hardware. Solves "${mainPainPoint}" with actionable insights from your phone.`,
        approach: `**Tracking**\n• Phone-based sleep detection\n• Environment factor correlation\n• "${secondPainPoint}" - circadian rhythm mapping\n\n**Optimization**\n• Personalized bedtime suggestions\n• Wind-down routine builder\n• Wake window optimization`,
        tech_stack: ["React Native", "TensorFlow Lite", "Supabase", "HealthKit"],
        market_fit: Math.min(87, problem.opportunity_score + Math.floor(Math.random() * 5)),
      },
    ];
  }
  
  // Default fallback for other categories
  return [
    {
      title: `${problem.title} AI Assistant`,
      description: `Directly addresses "${mainPainPoint}" with intelligent automation tailored for ${problem.category} users.`,
      approach: `**Phase 1 - Core Problem** (Week 1-2)\n• Build MVP focusing on "${mainPainPoint}"\n• Simple onboarding capturing user context\n• Core AI engine for personalized recommendations\n\n**Phase 2 - Expand Value** (Week 3-4)\n• Address "${secondPainPoint}"\n• Add analytics and progress tracking\n• Implement sharing features`,
      tech_stack: ["React", "Supabase", "OpenAI", "TailwindCSS"],
      market_fit: Math.min(88, problem.opportunity_score + Math.floor(Math.random() * 8)),
    },
    {
      title: `${problem.title} Chrome Extension`,
      description: `Browser-based solution for "${secondPainPoint}". Works where users already spend time.`,
      approach: `**Why Browser Extension?**\n• Zero friction adoption\n• Enhance existing workflows\n• Contextual help when needed\n\n**Core Features**\n• Overlay UI for quick actions\n• Keyboard shortcuts\n• Cross-site functionality`,
      tech_stack: ["Chrome Extension", "React", "Supabase"],
      market_fit: Math.min(82, problem.opportunity_score + Math.floor(Math.random() * 6)),
    },
    {
      title: `${problem.title} Community Platform`,
      description: `Connect people solving "${mainPainPoint}" together. Network effects create defensibility.`,
      approach: `**Community Features**\n• Discussion forums by topic\n• Resource sharing\n• Expert AMAs\n\n**Marketplace**\n• Templates and tools\n• Paid consulting connections\n• Peer learning`,
      tech_stack: ["Next.js", "Supabase", "Stripe Connect"],
      market_fit: Math.min(76, problem.opportunity_score + Math.floor(Math.random() * 5)),
    },
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let problemId: string | undefined;
    let updateAll = false;

    // Check if request has a body
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const rawBody = await req.json();
        
        // Validate input with Zod
        const validation = validateInput(refreshProblemSchema, rawBody);
        if (!validation.success) {
          return validationErrorResponse(validation, corsHeaders);
        }
        
        problemId = validation.data!.problemId;
        updateAll = validation.data!.updateAll || false;
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
      
      // Generate fresh sources based on updated metrics (preserving Reddit-only format)
      const freshSources = generateFreshSources(views, shares, demandVelocity, competitionGap, problem.sources);
      
      // Generate or update hidden insight if missing
      let hiddenInsight = problem.hidden_insight;
      if (!hiddenInsight || !hiddenInsight.surfaceAsk) {
        hiddenInsight = await generateHiddenInsightWithAI(
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

      // Check if AI solutions exist for this problem
      const { data: existingSolutions, error: solutionsError } = await supabase
        .from('solutions')
        .select('id')
        .eq('problem_id', problem.id)
        .eq('ai_generated', true)
        .limit(1);

      // If no AI solutions exist, create them
      if (!solutionsError && (!existingSolutions || existingSolutions.length === 0)) {
        const suggestions = generateSolutionSuggestions(problem);
        
        for (const suggestion of suggestions) {
          const { error: insertError } = await supabase
            .from('solutions')
            .insert({
              problem_id: problem.id,
              title: suggestion.title,
              description: suggestion.description,
              approach: suggestion.approach,
              tech_stack: suggestion.tech_stack,
              market_fit: suggestion.market_fit,
              ai_generated: true,
              created_by: '00000000-0000-0000-0000-000000000000', // System user
              status: 'concept',
              upvotes: Math.floor(Math.random() * 10) + 5,
              forks: Math.floor(Math.random() * 3) + 1,
              comments: Math.floor(Math.random() * 5) + 2,
            });

          if (insertError) {
            console.error(`Error creating solution for ${problem.id}:`, insertError);
          } else {
            console.log(`Created AI solution: ${suggestion.title}`);
          }
        }
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
