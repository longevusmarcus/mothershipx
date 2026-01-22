import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProblemData {
  title: string;
  subtitle?: string;
  category: string;
  niche: string;
  painPoints?: string[];
  marketSize?: string;
  opportunityScore: number;
  sentiment: string;
  sources?: any[];
  hiddenInsight?: any;
  competitors?: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problem, competitors, solutions } = await req.json() as {
      problem: ProblemData;
      competitors?: any[];
      solutions?: any[];
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build comprehensive context
    const competitorContext = competitors?.length 
      ? `\n\nExisting Competitors:\n${competitors.slice(0, 5).map(c => `- ${c.name}: ${c.description || 'No description'} (Rating: ${c.rating_label})`).join('\n')}`
      : '';

    const solutionContext = solutions?.length
      ? `\n\nExisting Solution Ideas:\n${solutions.slice(0, 3).map(s => `- ${s.title}: ${s.description}`).join('\n')}`
      : '';

    const hiddenInsightContext = problem.hiddenInsight
      ? `\n\nHidden Market Insight: ${problem.hiddenInsight.insight || JSON.stringify(problem.hiddenInsight)}`
      : '';

    const systemPrompt = `You are a legendary senior prompt engineer with 15+ years of experience building enterprise SaaS products. You specialize in crafting precise, actionable prompts that developers can use with AI coding tools like Lovable, Cursor, or Claude to build production-ready applications.

Your prompts are known for being:
- Hyper-specific and technically precise
- Including design system specifications
- Covering edge cases and error handling
- Specifying database schemas and API structures
- Including accessibility and performance requirements
- Production-ready from day one

You understand that great prompts include:
1. Clear product vision and user personas
2. Detailed technical architecture
3. Specific UI/UX requirements with design tokens
4. Database schema and relationships
5. API endpoints and data flow
6. Authentication and authorization patterns
7. Error handling and edge cases
8. Performance and accessibility requirements`;

    const userPrompt = `Based on this market opportunity, generate 3 distinct, production-ready prompts that a developer could paste into Lovable or similar AI coding tools to build a complete solution.

## Market Opportunity
Title: ${problem.title}
${problem.subtitle ? `Subtitle: ${problem.subtitle}` : ''}
Category: ${problem.category}
Niche: ${problem.niche}
Market Size: ${problem.marketSize || 'Unknown'}
Opportunity Score: ${problem.opportunityScore}/100
Market Sentiment: ${problem.sentiment}

${problem.painPoints?.length ? `## Pain Points\n${problem.painPoints.map(p => `- ${p}`).join('\n')}` : ''}
${competitorContext}
${solutionContext}
${hiddenInsightContext}

## Requirements for Each Prompt

Generate exactly 3 prompts with these characteristics:

### Prompt 1: "The MVP Sprint"
A focused, ship-fast prompt for building a minimal viable product in one session. Include:
- Core feature set (3-4 features max)
- Simple but elegant UI with dark/light mode
- Basic auth and data persistence
- Mobile-responsive design

### Prompt 2: "The Full Stack"
A comprehensive prompt for building a complete SaaS application. Include:
- Complete feature set addressing all pain points
- Advanced UI with animations and micro-interactions
- Full auth flow with social logins
- Subscription/payment integration
- Admin dashboard
- Email notifications
- Analytics tracking

### Prompt 3: "The Differentiator"
A creative prompt that takes an unconventional approach to solve the problem. Include:
- Unique angle that competitors haven't explored
- Innovative UX patterns
- Viral/growth mechanics built-in
- Community features
- AI-powered features where relevant

For each prompt, provide:
1. A catchy title
2. The estimated build complexity (1-5 scale)
3. Key differentiators from competitors
4. The complete prompt text (ready to paste)

Format your response as valid JSON with this structure:
{
  "prompts": [
    {
      "id": "mvp",
      "title": "string",
      "subtitle": "string",
      "complexity": number,
      "estimatedTime": "string",
      "differentiators": ["string"],
      "tags": ["string"],
      "prompt": "string (the full prompt text)"
    }
  ]
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
        temperature: 0.8,
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let parsedContent;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-prompts error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
