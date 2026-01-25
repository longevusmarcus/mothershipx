import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateIdeaRequest {
  problemTitle: string;
  problemCategory: string;
  painPoints: string[];
  niche: string;
  opportunityScore: number;
  demandVelocity?: number;
  competitionGap?: number;
  sources?: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: GenerateIdeaRequest = await req.json();
    const { problemTitle, problemCategory, painPoints, niche, opportunityScore, demandVelocity, competitionGap, sources } = body;

    console.log("Generating AI idea for:", problemTitle);

    const systemPrompt = `You are a senior product strategist at a top VC firm. Generate a startup idea that is genuinely innovative and addresses the problem directly. Think like a Y Combinator partner evaluating ideas.

Your response must be a JSON object with these exact fields:
- name: Short, memorable product name (2-3 words max, no generic AI prefixes)
- tagline: One-line value proposition (under 8 words, punchy)
- description: 2-3 sentence product description, clear and direct
- uniqueValue: What makes this different from competitors (be specific)
- targetPersona: Specific user persona with demographics
- keyFeatures: Array of exactly 4 features, each with "title" and "description" (no icons)
- techStack: Suggested tech stack array (3-5 technologies)
- monetization: Specific pricing strategy with numbers
- landingPage: Object for a professional landing page with:
  - hero: { headline (10 words max, no fluff), subheadline (clear value), ctaText (action verb) }
  - features: Array of 3 features with "title" and "description" only
  - stats: Array of 3 impressive stats with "value" and "label" (use realistic projections)
  - howItWorks: Array of 3 steps with "step" (1,2,3), "title", and "description"
  - testimonial: { quote (realistic, specific), author (name), role (title and company) }

Be bold and specific. No generic phrases like "leverage AI" or "streamline workflow". Every word should earn its place.`;

    const userPrompt = `Generate a startup idea for this problem:

**Problem:** ${problemTitle}
**Category:** ${problemCategory}
**Niche:** ${niche}
**Opportunity Score:** ${opportunityScore}/100
**Demand Velocity:** ${demandVelocity || 'N/A'}%
**Competition Gap:** ${competitionGap || 'N/A'}%

**Pain Points:**
${painPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Users are frustrated with current solutions'}

**Market Signals:**
${sources?.map(s => `- ${s.source}: ${s.metric || s.trend || 'Active discussion'}`).join('\n') || 'Growing interest across platforms'}

Create something that:
1. Directly solves the core pain points
2. Has clear monetization from day one
3. Can be built as MVP in 2-4 weeks
4. Has a defensible moat
5. Is different from obvious solutions

Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    console.log("AI response received, parsing...");

    // Extract JSON from response
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    jsonStr = jsonStr.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "");
    }

    const idea = JSON.parse(jsonStr);

    // Ensure all required fields exist with fallbacks
    if (!idea.landingPage.stats) {
      idea.landingPage.stats = [
        { value: "10x", label: "Faster Results" },
        { value: "90%", label: "User Satisfaction" },
        { value: "24/7", label: "Available" }
      ];
    }
    
    if (!idea.landingPage.howItWorks) {
      idea.landingPage.howItWorks = [
        { step: "1", title: "Sign Up", description: "Create your account in seconds" },
        { step: "2", title: "Configure", description: "Set up your preferences" },
        { step: "3", title: "Launch", description: "Start seeing results immediately" }
      ];
    }

    if (!idea.landingPage.testimonial.role) {
      idea.landingPage.testimonial.role = "Early Adopter";
    }

    console.log("Successfully generated idea:", idea.name);

    return new Response(
      JSON.stringify({ success: true, idea }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating idea:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
