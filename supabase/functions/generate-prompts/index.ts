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
}

interface PromptConfig {
  framework: string;
  complexity: number;
  features: {
    auth: boolean;
    payments: boolean;
    analytics: boolean;
    email: boolean;
    admin: boolean;
    ai: boolean;
    realtime: boolean;
    darkMode: boolean;
  };
  techStack: string[];
  designStyle: string;
}

const frameworkDescriptions: Record<string, string> = {
  "lovable": "React + Vite + TypeScript SPA with Tailwind CSS, shadcn/ui components, and Supabase backend",
  "nextjs": "Next.js 14+ with App Router, Server Components, Server Actions, and full-stack capabilities",
  "mobile-react-native": "React Native with Expo, React Navigation, and NativeWind for styling",
  "mobile-flutter": "Flutter with Material Design 3, Provider/Riverpod state management, and Dart",
  "chrome-extension": "Chrome Extension Manifest V3 with React popup, content scripts, and background service worker",
  "desktop-electron": "Electron app with React renderer, IPC communication, and native OS integrations",
  "api-only": "Backend API with Node.js/Deno, REST/GraphQL endpoints, database models, and authentication",
};

const designStyleDescriptions: Record<string, string> = {
  "minimal": "Clean whitespace, subtle shadows, monochromatic palette with single accent color, system fonts, minimal borders",
  "modern": "Rounded corners, gradient accents, frosted glass cards, smooth transitions, professional color palette",
  "playful": "Vibrant colors, bouncy animations, emoji accents, bold typography, rounded shapes, micro-interactions",
  "dark-luxe": "Dark backgrounds (#0a0a0a), gold/purple accents, subtle gradients, premium feel, elegant typography",
  "brutalist": "Bold black borders, raw HTML aesthetic, high contrast, unconventional layouts, system fonts",
  "glassmorphism": "Frosted glass effects, blur backdrops, transparency layers, soft shadows, gradient borders",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problem, competitors, solutions, config } = await req.json() as {
      problem: ProblemData;
      competitors?: any[];
      solutions?: any[];
      config?: PromptConfig;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Default config if not provided
    const finalConfig: PromptConfig = config || {
      framework: "lovable",
      complexity: 3,
      features: { auth: true, payments: false, analytics: false, email: false, admin: false, ai: false, realtime: false, darkMode: true },
      techStack: ["supabase", "tailwind", "shadcn"],
      designStyle: "modern",
    };

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

    // Build feature requirements
    const enabledFeatures = Object.entries(finalConfig.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => {
        const descriptions: Record<string, string> = {
          auth: "User authentication with signup, login, password reset, and session management",
          payments: "Stripe integration with subscription plans, checkout flow, and customer portal",
          analytics: "Usage tracking, event logging, and dashboard with key metrics",
          email: "Transactional emails with Resend/SendGrid for notifications and onboarding",
          admin: "Admin dashboard for user management, content moderation, and system settings",
          ai: "AI/LLM integration for intelligent features, content generation, or chat",
          realtime: "Real-time updates with WebSockets or Supabase Realtime for live collaboration",
          darkMode: "Light/dark mode toggle with system preference detection and persistent choice",
        };
        return descriptions[feature] || feature;
      });

    const frameworkDesc = frameworkDescriptions[finalConfig.framework] || finalConfig.framework;
    const designDesc = designStyleDescriptions[finalConfig.designStyle] || finalConfig.designStyle;

    const complexityDescriptions: Record<number, string> = {
      1: "Weekend project - single page, minimal features, quick prototype",
      2: "MVP - core functionality only, 2-3 pages, basic polish",
      3: "Production-ready - complete feature set, responsive, error handling, loading states",
      4: "Enterprise - scalable architecture, comprehensive testing, security hardening, documentation",
      5: "Full platform - multi-tenant, extensive admin tools, API, integrations, advanced analytics",
    };

    const systemPrompt = `You are a legendary senior prompt engineer with 15+ years of experience building enterprise applications. You specialize in crafting precise, actionable prompts for AI coding tools like Lovable, Cursor, and Claude.

Your prompts are known for being:
- Hyper-specific with exact technical requirements
- Including complete design system specifications
- Covering error states, loading states, and edge cases
- Specifying database schemas with relationships
- Including authentication and authorization patterns
- Production-ready from day one

CRITICAL FRAMEWORK CONTEXT:
The user wants to build for: ${frameworkDesc}

DESIGN STYLE:
${designDesc}

COMPLEXITY LEVEL: ${finalConfig.complexity}/5
${complexityDescriptions[finalConfig.complexity]}

REQUIRED FEATURES:
${enabledFeatures.length > 0 ? enabledFeatures.map(f => `- ${f}`).join('\n') : '- Basic functionality only'}

PREFERRED TECH STACK: ${finalConfig.techStack.join(', ')}`;

    const userPrompt = `Based on this market opportunity and the user's specific preferences, generate 3 distinct, production-ready prompts.

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

## User Preferences
- Framework: ${finalConfig.framework} (${frameworkDesc})
- Target Complexity: ${finalConfig.complexity}/5 (${complexityDescriptions[finalConfig.complexity]})
- Design Style: ${finalConfig.designStyle} (${designDesc})
- Tech Stack: ${finalConfig.techStack.join(', ')}
- Features: ${enabledFeatures.length > 0 ? enabledFeatures.join(', ') : 'Basic only'}

## Generate 3 Prompts

### Prompt 1: "Quick Start"
Aligned with user's complexity preference. Focus on getting something working fast with their chosen tech stack. Include:
- Core value proposition feature
- Clean implementation of ${finalConfig.designStyle} design
- ${enabledFeatures.slice(0, 2).join(' and ') || 'Basic functionality'}

### Prompt 2: "Complete Solution"  
Full implementation with all requested features. Include:
- All pain points addressed
- Complete ${finalConfig.framework} setup
- All requested features: ${enabledFeatures.join(', ') || 'core features'}
- Comprehensive ${finalConfig.designStyle} design system
- Error handling and loading states

### Prompt 3: "Market Dominator"
Strategic approach to beat competitors. Include:
- Unique differentiators not seen in competitor analysis
- Growth mechanics and viral loops
- Advanced ${finalConfig.designStyle} design with premium polish
- Features that justify premium pricing

For each prompt, the prompt text MUST:
1. Be specific to ${finalConfig.framework} with correct syntax and patterns
2. Include exact ${finalConfig.designStyle} design specifications
3. Reference ${finalConfig.techStack.join(', ')} implementation details
4. Be immediately usable - copy-paste ready

Format response as JSON:
{
  "prompts": [
    {
      "id": "quick-start",
      "title": "string",
      "subtitle": "string (one-line description)",
      "complexity": number (1-5),
      "estimatedTime": "string (e.g., '2-3 hours')",
      "differentiators": ["string", "string", "string"],
      "tags": ["string"] (include framework, key features),
      "prompt": "string (the complete, detailed prompt - 500+ words)"
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
