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

const IDEA_CATEGORIES = [
  { 
    type: "reallife", 
    label: "Real-Life Business",
    description: "Events, physical spaces, local communities, or in-person services"
  },
  { 
    type: "digital", 
    label: "Digital Product",
    description: "SaaS platform, mobile app, or web application"
  },
  { 
    type: "community", 
    label: "Community/Network",
    description: "Online community, membership platform, or network-based solution"
  },
  { 
    type: "physical", 
    label: "Physical Product/Goods",
    description: "Physical product, hardware device, or tangible goods"
  },
  { 
    type: "futuristic", 
    label: "Technical Breakthrough",
    description: "Cutting-edge technology using AI, blockchain, IoT, AR/VR, or emerging tech"
  }
];

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

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const body: GenerateIdeaRequest = await req.json();
    const { problemTitle, problemCategory, painPoints, niche, opportunityScore, demandVelocity, competitionGap, sources } = body;

    console.log("Generating diverse AI ideas for:", problemTitle);

    // Generate 3-4 ideas in parallel across different categories
    const selectedCategories = shuffleArray([...IDEA_CATEGORIES]).slice(0, 4);
    
    const ideaPromises = selectedCategories.map(category => 
      generateSingleIdea({
        category,
        problemTitle,
        problemCategory,
        painPoints,
        niche,
        opportunityScore,
        demandVelocity,
        competitionGap,
        sources,
        LOVABLE_API_KEY,
        supabase
      })
    );

    const results = await Promise.allSettled(ideaPromises);
    
    const ideas = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value);

    if (ideas.length === 0) {
      throw new Error("Failed to generate any ideas");
    }

    console.log(`Successfully generated ${ideas.length} diverse ideas`);

    return new Response(
      JSON.stringify({ success: true, ideas, idea: ideas[0] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating ideas:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function generateSingleIdea({
  category,
  problemTitle,
  problemCategory,
  painPoints,
  niche,
  opportunityScore,
  demandVelocity,
  competitionGap,
  sources,
  LOVABLE_API_KEY,
  supabase
}: {
  category: { type: string; label: string; description: string };
  problemTitle: string;
  problemCategory: string;
  painPoints: string[];
  niche: string;
  opportunityScore: number;
  demandVelocity?: number;
  competitionGap?: number;
  sources?: any[];
  LOVABLE_API_KEY: string;
  supabase: any;
}): Promise<any> {
  
  const categorySpecificPrompt = getCategoryPrompt(category);

  const systemPrompt = `You are a senior product strategist at a top VC firm. Generate a ${category.label} startup idea that is genuinely innovative and addresses the problem directly. Think like a Y Combinator partner evaluating ideas.

**IDEA TYPE: ${category.label.toUpperCase()}**
${categorySpecificPrompt}

Your response must be a JSON object with these exact fields:
- ideaType: "${category.type}" (the category of this idea)
- ideaLabel: "${category.label}" (human-readable category)
- name: Short, memorable product/company name (2-3 words max, no generic AI prefixes)
- tagline: One-line value proposition (under 8 words, punchy)
- description: 2-3 sentence product description, clear and direct
- uniqueValue: What makes this different from competitors (be specific)
- targetPersona: Specific user persona with demographics
- keyFeatures: Array of exactly 4 features, each with "title" and "description"
- techStack: Suggested tech stack or resources array (3-5 items)
- monetization: Specific pricing strategy with numbers
- marketFit: Integer 0-100 representing how well this solution fits the problem
- landingPage: Object for a professional landing page with:
  - hero: { headline (10 words max), subheadline (clear value), ctaText (action verb) }
  - features: Array of EXACTLY 3 features with "title" and "description"
  - stats: Array of EXACTLY 3 impressive but realistic metrics with "value" and "label"
  - howItWorks: Array of EXACTLY 3 steps with "step" (1,2,3), "title", and "description" - specific to how THIS product works
  - testimonial: { quote (realistic), author (realistic name), role (job title) }
  - productDescription: A brief description (under 30 words) for generating a mockup image

Be bold, creative, and specific to the ${category.label} category.`;

  const userPrompt = `Generate a **${category.label}** startup idea for this problem:

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

Create a ${category.label} solution that:
1. Directly solves the core pain points
2. Has clear monetization from day one
3. Has a defensible moat
4. Is innovative and bold for its category

Return ONLY valid JSON.`;

  try {
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
      console.error(`AI error for ${category.type}:`, response.status);
      return null;
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Extract JSON
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    jsonStr = jsonStr.trim().replace(/```json?\n?/g, "").replace(/```/g, "");

    const idea = JSON.parse(jsonStr);
    
    // Ensure category fields are set
    idea.ideaType = category.type;
    idea.ideaLabel = category.label;

    // Validate and ensure exactly 3 features
    if (!idea.landingPage?.features || idea.landingPage.features.length < 3) {
      idea.landingPage = idea.landingPage || {};
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
        { value: "85%", label: "User Satisfaction" },
        { value: "24/7", label: "Available" }
      ];
    }

    // Validate howItWorks
    const genericSteps = ["sign up", "configure", "launch", "get started", "create account"];
    const hasGenericSteps = idea.landingPage.howItWorks?.some((step: any) => 
      genericSteps.some(g => step.title?.toLowerCase().includes(g))
    );

    if (!idea.landingPage.howItWorks || idea.landingPage.howItWorks.length < 3 || hasGenericSteps) {
      const productName = idea.name || "the product";
      idea.landingPage.howItWorks = [
        { step: "1", title: `Discover ${productName}`, description: idea.keyFeatures?.[0]?.description || "Start with the core experience" },
        { step: "2", title: "Get Results", description: idea.keyFeatures?.[1]?.description || "See immediate value and outcomes" },
        { step: "3", title: "Scale Up", description: idea.keyFeatures?.[2]?.description || "Expand usage as you grow" }
      ];
    }

    // Ensure marketFit
    if (typeof idea.marketFit !== 'number' || idea.marketFit < 0 || idea.marketFit > 100) {
      const baseScore = 60;
      const opportunityBonus = Math.min(15, opportunityScore / 10);
      const demandBonus = demandVelocity ? Math.min(10, demandVelocity / 10) : 5;
      const gapBonus = competitionGap ? Math.min(10, competitionGap / 10) : 5;
      idea.marketFit = Math.round(Math.min(95, baseScore + opportunityBonus + demandBonus + gapBonus));
    }

    // Ensure testimonial
    if (!idea.landingPage.testimonial?.quote) {
      idea.landingPage.testimonial = {
        quote: `${idea.name} completely changed how I approach ${problemCategory.toLowerCase()}. Highly recommended.`,
        author: "Alex Rivera",
        role: "Founder at TechStart"
      };
    }

    // Generate mockup image
    console.log(`Generating mockup for ${category.type} idea: ${idea.name}`);
    try {
      const mockupPrompt = getMockupPrompt(category, idea);
      
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: mockupPrompt }],
          modalities: ["image", "text"]
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const mockupBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (mockupBase64) {
          const base64Data = mockupBase64.replace(/^data:image\/\w+;base64,/, '');
          const imageBytes = decode(base64Data);
          const fileName = `${crypto.randomUUID()}.png`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('idea-mockups')
            .upload(fileName, imageBytes, { contentType: 'image/png', upsert: false });
          
          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('idea-mockups')
              .getPublicUrl(fileName);
            
            idea.landingPage.mockupImage = publicUrl;
            console.log(`Mockup uploaded for ${idea.name}:`, publicUrl);
          }
        }
      }
    } catch (imgError) {
      console.log(`Mockup error for ${idea.name}, continuing:`, imgError);
    }

    return idea;
  } catch (error) {
    console.error(`Error generating ${category.type} idea:`, error);
    return null;
  }
}

function getCategoryPrompt(category: { type: string; label: string; description: string }): string {
  switch (category.type) {
    case "reallife":
      return `This should be a real-life business: events, physical spaces, local communities, or in-person services.
Focus on:
- In-person experiences and human connection
- Local or regional market focus
- Event-based or recurring gathering model
- Physical venue or mobile service considerations
- Community building through real-world interaction
Examples: Curated dinner events, co-working space, wellness retreat, local meetup series, pop-up experiences, coaching/consulting practice, workshop series`;

    case "digital":
      return `This should be a SaaS platform, mobile app, or web application.
Focus on:
- Sleek user interface and great UX
- Subscription or usage-based pricing
- Scalable cloud infrastructure
- Can be built as MVP in 2-4 weeks`;
    
    case "community":
      return `This should be a community platform, membership network, or collaborative solution.
Focus on:
- Network effects and community building
- Membership tiers or community-driven revenue
- User-generated content or peer-to-peer value
- Engagement loops and retention mechanisms
Examples: Discord community, membership platform, marketplace, peer network`;
    
    case "physical":
      return `This should be a physical product, hardware device, or tangible goods.
Focus on:
- Product design and manufacturing considerations
- Direct-to-consumer or B2B sales
- Supply chain and distribution
- Product-market fit in physical space
Examples: Smart device, consumer product, kit/toolkit, physical subscription box`;
    
    case "futuristic":
      return `This should be a cutting-edge technical breakthrough using emerging technology.
Focus on:
- AI/ML, blockchain, IoT, AR/VR, robotics, or biotech
- Novel technical approach that's now becoming feasible
- First-mover advantage in emerging tech
- Bold vision that sounds like sci-fi but is buildable
Examples: AI agent, decentralized protocol, smart wearable, spatial computing app`;
    
    default:
      return "Create an innovative solution.";
  }
}

function getMockupPrompt(category: { type: string; label: string }, idea: any): string {
  const baseName = idea.name || "Product";
  const baseDesc = idea.landingPage?.productDescription || idea.description || "";

  switch (category.type) {
    case "reallife":
      return `A beautiful lifestyle photography shot of "${baseName}" - ${baseDesc}. People connecting at an event, warm ambient lighting, authentic human interaction, cozy inviting atmosphere. Editorial style photography. Ultra high resolution.`;

    case "digital":
      return `A clean, minimal, modern SaaS dashboard interface for "${baseName}" - ${baseDesc}. Dark theme, professional UI design, data visualization, minimal aesthetic. Ultra high resolution product screenshot mockup.`;
    
    case "community":
      return `A vibrant community platform interface for "${baseName}" - ${baseDesc}. Social feed, member profiles, discussion threads, modern design. Light and welcoming aesthetic. Ultra high resolution product screenshot mockup.`;
    
    case "physical":
      return `A premium product photography shot of "${baseName}" - ${baseDesc}. Clean white background, professional lighting, sleek industrial design, minimalist aesthetic. Ultra high resolution product photo mockup.`;
    
    case "futuristic":
      return `A futuristic, sci-fi inspired interface for "${baseName}" - ${baseDesc}. Holographic elements, neon accents, advanced AI visualizations, cyberpunk aesthetic with clean modern design. Ultra high resolution product screenshot mockup.`;
    
    default:
      return `A professional mockup for "${baseName}" - ${baseDesc}. Ultra high resolution.`;
  }
}
