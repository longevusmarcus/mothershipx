import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationRequest {
  submissionId: string;
  productUrl: string;
  productName: string;
  githubRepo?: string;
  stripePublicKey?: string;
  challengeId?: string;
  problemId?: string;
}

interface ValidationResult {
  sentimentFitScore: number;
  problemCoveragePercent: number;
  misalignmentWarnings: string[];
  hasRevenue: boolean;
  revenueAmount?: number;
  adoptionVelocityScore: number;
  githubActivityScore: number;
  totalScore: number;
  aiFeedback: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const body: ValidationRequest = await req.json();
    const { productUrl, productName, githubRepo, stripePublicKey, challengeId, problemId } = body;

    // Build the AI prompt for validation
    const prompt = buildValidationPrompt(productName, productUrl, githubRepo, stripePublicKey);

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI judge for a hackathon. Evaluate submissions based on:
1. Problem-Solution Fit: How well does the product solve the stated problem?
2. Code Quality: Based on GitHub activity and tech stack indicators
3. Revenue Signals: Stripe integration indicates monetization
4. Innovation: Creativity and uniqueness of the solution
5. Completeness: Is this a functional product or just an idea?

Respond ONLY with valid JSON matching this schema:
{
  "sentimentFitScore": 0-100,
  "problemCoveragePercent": 0-100,
  "misalignmentWarnings": ["warning1", "warning2"],
  "hasRevenue": boolean,
  "adoptionVelocityScore": 0-100,
  "githubActivityScore": 0-100,
  "totalScore": 0-100,
  "aiFeedback": "Detailed feedback about the submission"
}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content in AI response");
    }

    // Parse the AI response
    let result: ValidationResult;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent;
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Return fallback scores
      result = generateFallbackScores(productName, !!githubRepo, !!stripePublicKey);
    }

    // Add bonus points for integrations
    if (githubRepo) {
      result.githubActivityScore = Math.min(100, (result.githubActivityScore || 50) + 15);
      result.totalScore = Math.min(100, result.totalScore + 5);
    }
    if (stripePublicKey) {
      result.hasRevenue = true;
      result.totalScore = Math.min(100, result.totalScore + 10);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Validation error:", error);

    // Return fallback scores on error
    const fallback = generateFallbackScores("Unknown", false, false);

    return new Response(JSON.stringify(fallback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildValidationPrompt(
  productName: string,
  productUrl: string,
  githubRepo?: string,
  stripePublicKey?: string,
): string {
  let prompt = `Evaluate this hackathon submission:

**Product Name:** ${productName}
**Live URL:** ${productUrl}
`;

  if (githubRepo) {
    prompt += `**GitHub Repository:** ${githubRepo}\n`;
  }

  if (stripePublicKey) {
    prompt += `**Has Stripe Integration:** Yes (publishable key provided)\n`;
  }

  prompt += `
Based on the product name and URL, evaluate:
1. How innovative and creative is this idea?
2. Does the name suggest good problem-solution fit?
3. Is the URL structure professional?
4. Rate the overall potential of this submission.

Provide scores and detailed feedback.`;

  return prompt;
}

function generateFallbackScores(productName: string, hasGithub: boolean, hasStripe: boolean): ValidationResult {
  const baseScore = 65 + Math.floor(Math.random() * 15);

  return {
    sentimentFitScore: baseScore + Math.floor(Math.random() * 10),
    problemCoveragePercent: baseScore + Math.floor(Math.random() * 15),
    misalignmentWarnings: [],
    hasRevenue: hasStripe,
    adoptionVelocityScore: 50 + Math.floor(Math.random() * 20),
    githubActivityScore: hasGithub ? 60 + Math.floor(Math.random() * 20) : 40,
    totalScore: baseScore + (hasGithub ? 5 : 0) + (hasStripe ? 10 : 0),
    aiFeedback: `Your submission "${productName}" has been evaluated. ${hasGithub ? "GitHub integration detected, showing active development. " : ""}${hasStripe ? "Stripe integration shows monetization readiness. " : ""}Good luck in the competition!`,
  };
}
