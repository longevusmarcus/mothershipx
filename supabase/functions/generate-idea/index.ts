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

    // Build comprehensive prompt with all dashboard context
    const systemPrompt = `You are an elite startup product strategist and designer. Your task is to generate a highly innovative, market-ready product idea that directly solves the given problem. You must think like a Y Combinator partner evaluating ideas.

Your response must be a JSON object with these exact fields:
- name: Catchy, memorable product name (2-3 words max)
- tagline: One-line value proposition (under 10 words)
- description: 2-3 sentence product description
- uniqueValue: What makes this different from competitors
- targetPersona: Specific user persona (be precise)
- keyFeatures: Array of 4-5 key features with icons
- techStack: Suggested tech stack array
- monetization: Revenue model suggestion
- landingPage: Object with hero, features, testimonial sections for elegant landing page

Be bold, creative, and think of solutions that could genuinely disrupt the market.`;

    const userPrompt = `Generate a brilliant product idea for this problem:

**Problem:** ${problemTitle}
**Category:** ${problemCategory}
**Niche:** ${niche}
**Market Opportunity Score:** ${opportunityScore}/100
**Demand Velocity:** ${demandVelocity || 'N/A'}%
**Competition Gap:** ${competitionGap || 'N/A'}%

**Pain Points Users Are Experiencing:**
${painPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'General frustration with current solutions'}

**Trend Sources:**
${sources?.map(s => `- ${s.source}: ${s.metric || s.trend || 'Active discussion'}`).join('\n') || 'Multiple social platforms showing interest'}

Create a product that:
1. Directly addresses the core pain points
2. Has a clear path to monetization
3. Could be built as an MVP in 2-4 weeks
4. Has viral/network effects potential
5. Is differentiated from obvious solutions

Return ONLY valid JSON matching this schema:
{
  "name": "ProductName",
  "tagline": "Short punchy tagline",
  "description": "2-3 sentence description of the product",
  "uniqueValue": "What makes this genuinely different",
  "targetPersona": "Specific persona description",
  "keyFeatures": [
    { "icon": "Zap", "title": "Feature 1", "description": "Brief description" },
    { "icon": "Shield", "title": "Feature 2", "description": "Brief description" },
    { "icon": "Brain", "title": "Feature 3", "description": "Brief description" },
    { "icon": "Rocket", "title": "Feature 4", "description": "Brief description" }
  ],
  "techStack": ["React", "Supabase", "OpenAI"],
  "monetization": "Freemium with $X/mo pro tier",
  "landingPage": {
    "hero": {
      "headline": "Bold headline that hooks",
      "subheadline": "Supporting text that explains the value",
      "ctaText": "Get Started Free"
    },
    "features": [
      { "icon": "Sparkles", "title": "Feature title", "description": "Feature description" }
    ],
    "testimonial": {
      "quote": "Sample testimonial quote",
      "author": "Name, Role",
      "avatar": "initials"
    },
    "gradient": "from-violet-600 to-indigo-600"
  }
}`;

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

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Clean and parse JSON
    jsonStr = jsonStr.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "");
    }

    const idea = JSON.parse(jsonStr);

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
