import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Problem {
  id: string;
  title: string;
  category: string;
  niche: string;
  pain_points: string[] | null;
  opportunity_score: number;
  demand_velocity: number | null;
  competition_gap: number | null;
  sources: any[] | null;
}

interface GeneratedIdea {
  name: string;
  tagline: string;
  description: string;
  uniqueValue: string;
  targetPersona: string;
  keyFeatures: { title: string; description: string }[];
  techStack: string[];
  monetization: string;
  marketFit: number;
  landingPage: {
    hero: { headline: string; subheadline: string; ctaText: string };
    features: { title: string; description: string }[];
    stats: { value: string; label: string }[];
    howItWorks: { step: string; title: string; description: string }[];
    testimonial: { quote: string; author: string; role: string };
    mockupImage?: string;
  };
}

async function generateIdeaForProblem(problem: Problem, apiKey: string): Promise<GeneratedIdea | null> {
  const systemPrompt = `You are a senior product strategist at a top VC firm. Generate a startup idea that is genuinely innovative and addresses the problem directly. Think like a Y Combinator partner evaluating ideas.

Your response must be a JSON object with these exact fields:
- name: Short, memorable product name (2-3 words max, no generic AI prefixes)
- tagline: One-line value proposition (under 8 words, punchy)
- description: 2-3 sentence product description, clear and direct
- uniqueValue: What makes this different from competitors (be specific)
- targetPersona: Specific user persona with demographics
- keyFeatures: Array of exactly 4 features, each with "title" and "description"
- techStack: Suggested tech stack array (3-5 technologies)
- monetization: Specific pricing strategy with numbers
- marketFit: Integer 0-100 representing how well this solution fits the problem. Be realistic - most ideas should score 60-85.
- landingPage: Object for a professional landing page with:
  - hero: { headline (10 words max), subheadline (clear value), ctaText (action verb) }
  - features: Array of EXACTLY 3 features with "title" and "description" - these must be the 3 most important product capabilities
  - stats: Array of EXACTLY 3 impressive but realistic metrics with "value" and "label"
  - howItWorks: Array of EXACTLY 3 steps with "step" (1,2,3), "title", and "description" - these MUST be specific to how THIS product actually works, NOT generic steps like "Sign Up" or "Configure". Describe the actual user journey with this specific product.
  - testimonial: { quote (realistic, specific to the product), author (realistic name), role (job title at realistic company) }
  - productDescription: A brief description (under 30 words) of what the product interface/dashboard looks like for generating a mockup image

Be bold and specific. Every step in howItWorks should describe a real action users take with THIS product.`;

  const userPrompt = `Generate a startup idea for this problem:

**Problem:** ${problem.title}
**Category:** ${problem.category}
**Niche:** ${problem.niche}
**Opportunity Score:** ${problem.opportunity_score}/100
**Demand Velocity:** ${problem.demand_velocity || 'N/A'}%
**Competition Gap:** ${problem.competition_gap || 'N/A'}%

**Pain Points:**
${problem.pain_points?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Users are frustrated with current solutions'}

**Market Signals:**
${problem.sources?.map((s: any) => `- ${s.source}: ${s.metric || s.trend || 'Active discussion'}`).join('\n') || 'Growing interest across platforms'}

Create something that:
1. Directly solves the core pain points
2. Has clear monetization from day one
3. Can be built as MVP in 2-4 weeks
4. Has a defensible moat

CRITICAL REQUIREMENTS:
- landingPage.features MUST have exactly 3 items
- landingPage.howItWorks MUST have exactly 3 product-specific steps (NOT generic like "Sign Up", "Configure", "Launch")
- Example good howItWorks: For a social analysis app: [{"step":"1","title":"Upload Screenshots","description":"Share your group chat screenshots securely"},{"step":"2","title":"Get Analysis","description":"AI identifies social dynamics and exclusion patterns"},{"step":"3","title":"Receive Scripts","description":"Get personalized conversation starters to rebuild connections"}]

Return ONLY valid JSON.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`AI error for ${problem.title}:`, response.status);
      return null;
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    jsonStr = jsonStr.trim().replace(/```json?\n?/g, "").replace(/```/g, "");

    const idea = JSON.parse(jsonStr);

    // Validate and ensure exactly 3 features
    if (!idea.landingPage.features || idea.landingPage.features.length < 3) {
      idea.landingPage.features = idea.keyFeatures?.slice(0, 3) || [
        { title: "Core Feature", description: "The main capability that solves your problem" },
        { title: "Smart Insights", description: "Data-driven recommendations tailored to you" },
        { title: "Easy Integration", description: "Works with your existing tools seamlessly" }
      ];
    }
    idea.landingPage.features = idea.landingPage.features.slice(0, 3);

    // Ensure stats exist
    if (!idea.landingPage.stats || idea.landingPage.stats.length < 3) {
      idea.landingPage.stats = [
        { value: "10x", label: "Faster Results" },
        { value: "85%", label: "User Retention" },
        { value: "24/7", label: "Available" }
      ];
    }

    // Validate howItWorks - if it contains generic steps, regenerate based on the product
    const genericSteps = ["sign up", "configure", "launch", "get started", "create account"];
    const hasGenericSteps = idea.landingPage.howItWorks?.some((step: any) => 
      genericSteps.some(g => step.title?.toLowerCase().includes(g))
    );

    if (!idea.landingPage.howItWorks || idea.landingPage.howItWorks.length < 3 || hasGenericSteps) {
      const productName = idea.name || "the product";
      idea.landingPage.howItWorks = [
        { 
          step: "1", 
          title: `Connect to ${productName}`, 
          description: `Link your existing data or upload the information ${productName} needs to analyze` 
        },
        { 
          step: "2", 
          title: "Get Instant Analysis", 
          description: idea.keyFeatures?.[0]?.description || "Receive AI-powered insights tailored to your situation" 
        },
        { 
          step: "3", 
          title: "Take Action", 
          description: idea.keyFeatures?.[1]?.description || "Execute on recommendations with guided next steps" 
        }
      ];
    }

    // Ensure marketFit exists and is valid
    if (typeof idea.marketFit !== 'number' || idea.marketFit < 0 || idea.marketFit > 100) {
      const baseScore = 60;
      const opportunityBonus = Math.min(15, problem.opportunity_score / 10);
      const demandBonus = problem.demand_velocity ? Math.min(10, problem.demand_velocity / 10) : 5;
      const gapBonus = problem.competition_gap ? Math.min(10, problem.competition_gap / 10) : 5;
      idea.marketFit = Math.round(Math.min(95, baseScore + opportunityBonus + demandBonus + gapBonus));
    }

    // Ensure testimonial exists
    if (!idea.landingPage.testimonial?.quote) {
      idea.landingPage.testimonial = {
        quote: `${idea.name} completely changed how I approach ${problem.category.toLowerCase()}. The insights are incredible.`,
        author: "Sarah Chen",
        role: "Product Manager at Stripe"
      };
    }

    // Generate product mockup image using Nano banana
    console.log(`Generating mockup for ${idea.name}...`);
    const mockupPrompt = `A clean, minimal, modern SaaS dashboard interface for "${idea.name}" - ${idea.landingPage.productDescription || idea.description}. Dark theme with subtle gradients, professional UI design, data visualization elements, glassmorphism effects, ultra modern aesthetic. High resolution product screenshot mockup on a dark background.`;

    try {
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            { role: "user", content: mockupPrompt }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const mockupImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (mockupImage) {
          idea.landingPage.mockupImage = mockupImage;
          console.log(`✓ Mockup generated for ${idea.name}`);
        }
      } else {
        console.log(`Mockup generation failed for ${idea.name}, continuing without image`);
      }
    } catch (imgError) {
      console.log(`Mockup generation error for ${idea.name}:`, imgError);
    }

    return idea;
  } catch (error) {
    console.error(`Failed to generate idea for ${problem.title}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting batch idea generation...");
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all problems
    const { data: problems, error: problemsError } = await supabase
      .from("problems")
      .select("id, title, category, niche, pain_points, opportunity_score, demand_velocity, competition_gap, sources")
      .order("opportunity_score", { ascending: false });

    if (problemsError) {
      console.error("Failed to fetch problems:", problemsError);
      throw problemsError;
    }

    console.log(`Found ${problems?.length || 0} problems`);

    // Get existing solutions to avoid duplicates
    const { data: existingSolutions } = await supabase
      .from("solutions")
      .select("problem_id")
      .eq("ai_generated", true);

    const existingProblemIds = new Set(existingSolutions?.map(s => s.problem_id) || []);
    
    // Filter to problems without AI-generated solutions
    const problemsNeedingIdeas = problems?.filter(p => !existingProblemIds.has(p.id)) || [];
    
    console.log(`${problemsNeedingIdeas.length} problems need ideas`);

    let successCount = 0;
    let errorCount = 0;

    // Process problems sequentially with delay to avoid rate limits
    for (const problem of problemsNeedingIdeas) {
      console.log(`Generating idea for: ${problem.title}`);
      
      const idea = await generateIdeaForProblem(problem, LOVABLE_API_KEY);
      
      if (idea) {
        // Build approach text from idea data
        const approach = `## Unique Value
${idea.uniqueValue}

## Target Persona
${idea.targetPersona}

## Key Features
${idea.keyFeatures?.map(f => `- **${f.title}**: ${f.description}`).join('\n')}

## Monetization
${idea.monetization}

## Tech Stack
${idea.techStack?.join(', ')}`;

        // Save to solutions table
        const { error: insertError } = await supabase
          .from("solutions")
          .insert({
            problem_id: problem.id,
            title: idea.name,
            description: idea.tagline + " - " + idea.description,
            approach: approach,
            tech_stack: idea.techStack || [],
            market_fit: idea.marketFit,
            ai_generated: true,
            landing_page: idea.landingPage,
            created_by: "00000000-0000-0000-0000-000000000000", // System user placeholder
            last_editor_id: null,
          });

        if (insertError) {
          console.error(`Failed to save idea for ${problem.title}:`, insertError);
          errorCount++;
        } else {
          console.log(`✓ Saved idea "${idea.name}" for ${problem.title}`);
          successCount++;
        }
      } else {
        errorCount++;
      }

      // Delay between requests to avoid rate limits (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const result = {
      success: true,
      processed: problemsNeedingIdeas.length,
      created: successCount,
      errors: errorCount,
      skipped: (problems?.length || 0) - problemsNeedingIdeas.length,
    };

    console.log("Batch generation complete:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch generation failed:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
