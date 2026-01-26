import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create supabase client for storage uploads
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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
- keyFeatures: Array of exactly 4 features, each with "title" and "description"
- techStack: Suggested tech stack array (3-5 technologies)
- monetization: Specific pricing strategy with numbers
- marketFit: Integer 0-100 representing how well this solution fits the problem. Consider: direct pain point coverage, market timing, competitive differentiation, monetization clarity, and technical feasibility. Be realistic - most ideas should score 60-85.
- landingPage: Object for a professional landing page with:
  - hero: { headline (10 words max), subheadline (clear value), ctaText (action verb) }
  - features: Array of EXACTLY 3 features with "title" and "description" - these must be the 3 most important product capabilities
  - stats: Array of EXACTLY 3 impressive but realistic metrics with "value" and "label"
  - howItWorks: Array of EXACTLY 3 steps with "step" (1,2,3), "title", and "description" - these MUST be specific to how THIS product actually works, NOT generic steps like "Sign Up" or "Configure". Describe the actual user journey with this specific product.
  - testimonial: { quote (realistic, specific to the product), author (realistic name), role (job title at realistic company) }
  - productDescription: A brief description (under 30 words) of what the product interface/dashboard looks like for generating a mockup image

Be bold and specific. Every step in howItWorks should describe a real action users take with THIS product.`;

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

CRITICAL REQUIREMENTS:
- landingPage.features MUST have exactly 3 items
- landingPage.howItWorks MUST have exactly 3 product-specific steps (NOT generic like "Sign Up", "Configure", "Launch")
- Example good howItWorks: For a social analysis app: [{"step":"1","title":"Upload Screenshots","description":"Share your group chat screenshots securely"},{"step":"2","title":"Get Analysis","description":"AI identifies social dynamics and exclusion patterns"},{"step":"3","title":"Receive Scripts","description":"Get personalized conversation starters to rebuild connections"}]

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

    // Validate and ensure exactly 3 features
    if (!idea.landingPage.features || idea.landingPage.features.length < 3) {
      idea.landingPage.features = idea.keyFeatures?.slice(0, 3) || [
        { title: "Core Feature", description: "The main capability that solves your problem" },
        { title: "Smart Insights", description: "Data-driven recommendations tailored to you" },
        { title: "Easy Integration", description: "Works with your existing tools seamlessly" }
      ];
    }
    // Ensure exactly 3 features
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
      // Generate product-specific steps based on the idea
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
      // Calculate based on available signals
      const baseScore = 60;
      const opportunityBonus = Math.min(15, opportunityScore / 10);
      const demandBonus = demandVelocity ? Math.min(10, demandVelocity / 10) : 5;
      const gapBonus = competitionGap ? Math.min(10, competitionGap / 10) : 5;
      idea.marketFit = Math.round(Math.min(95, baseScore + opportunityBonus + demandBonus + gapBonus));
    }

    // Ensure testimonial exists
    if (!idea.landingPage.testimonial?.quote) {
      idea.landingPage.testimonial = {
        quote: `${idea.name} completely changed how I approach ${problemCategory.toLowerCase()}. The insights are incredible.`,
        author: "Sarah Chen",
        role: "Product Manager at Stripe"
      };
    }

    // Generate product mockup image
    console.log("Generating product mockup...");
    const mockupPrompt = `A clean, minimal, modern SaaS dashboard interface for "${idea.name}" - ${idea.landingPage.productDescription || idea.description}. Dark theme, professional UI design, data visualization, minimal aesthetic. Ultra high resolution product screenshot mockup.`;

    try {
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
        const mockupBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (mockupBase64) {
          console.log("Mockup generated, uploading to storage...");
          
          // Extract base64 data (remove data:image/png;base64, prefix)
          const base64Data = mockupBase64.replace(/^data:image\/\w+;base64,/, '');
          const imageBytes = decode(base64Data);
          
          // Generate unique filename
          const fileName = `${crypto.randomUUID()}.png`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('idea-mockups')
            .upload(fileName, imageBytes, {
              contentType: 'image/png',
              upsert: false
            });
          
          if (!uploadError && uploadData) {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('idea-mockups')
              .getPublicUrl(fileName);
            
            idea.landingPage.mockupImage = publicUrl;
            console.log("Product mockup uploaded successfully:", publicUrl);
          } else {
            console.log("Storage upload error:", uploadError);
          }
        }
      } else {
        const errText = await imageResponse.text();
        console.log("Mockup generation failed:", imageResponse.status, errText);
      }
    } catch (imgError) {
      console.log("Mockup generation error, continuing without image:", imgError);
    }

    console.log("Successfully generated idea:", idea.name, "with mockup:", !!idea.landingPage.mockupImage);

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
