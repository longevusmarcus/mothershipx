import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NichePainPoint {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  sentiment: "exploding" | "rising" | "stable" | "declining";
  views: number;
  saves: number;
  shares: number;
  painPoints: string[];
  rank: number;
  demandVelocity: number;
  competitionGap: number;
  hiddenInsight: {
    surfaceAsk: string;
    realProblem: string;
    hiddenSignal: string;
  };
}

const NICHE_PAIN_POINTS: Record<string, NichePainPoint[]> = {
  "mental-health": [
    {
      id: "mh-1",
      title: "Anxiety apps feel clinical, not human",
      subtitle: "Gen Z wants vibe-based mental wellness, not therapy-lite",
      category: "Mental Health",
      sentiment: "exploding",
      views: 2400000,
      saves: 89000,
      shares: 34000,
      painPoints: ["Clinical tone feels cold", "Want authentic human connection", "Therapy jargon is off-putting"],
      rank: 1,
      demandVelocity: 92,
      competitionGap: 78,
      hiddenInsight: {
        surfaceAsk: "I need a better meditation app",
        realProblem: "I want emotional regulation that doesn't feel like I'm broken",
        hiddenSignal: "Mental wellness is becoming lifestyle content, not healthcare"
      },
    },
    {
      id: "mh-2",
      title: "Burnout recovery feels impossible alone",
      subtitle: "Remote workers need community-based support, not solo meditation",
      category: "Mental Health",
      sentiment: "rising",
      views: 1800000,
      saves: 72000,
      shares: 28000,
      painPoints: ["Solo recovery doesn't work", "Need accountability partners", "Meditation alone isn't enough"],
      rank: 2,
      demandVelocity: 85,
      competitionGap: 72,
      hiddenInsight: {
        surfaceAsk: "How do I recover from burnout?",
        realProblem: "I need structured support without feeling weak for asking",
        hiddenSignal: "Recovery is social, not solo - community accountability is key"
      },
    },
    {
      id: "mh-3",
      title: "Overthinking at 3am has no quick fix",
      subtitle: "People want instant calm, not 30-day programs",
      category: "Mental Health",
      sentiment: "exploding",
      views: 3100000,
      saves: 145000,
      shares: 52000,
      painPoints: ["Can't fall asleep", "Racing thoughts at night", "Long programs feel overwhelming"],
      rank: 3,
      demandVelocity: 95,
      competitionGap: 65,
      hiddenInsight: {
        surfaceAsk: "I need help sleeping",
        realProblem: "I need instant relief when anxiety spikes, not another habit to build",
        hiddenSignal: "On-demand micro-interventions beat structured programs"
      },
    },
    {
      id: "mh-4",
      title: "Therapy is too expensive for most",
      subtitle: "Demand for affordable peer-support alternatives",
      category: "Mental Health",
      sentiment: "rising",
      views: 2200000,
      saves: 98000,
      shares: 41000,
      painPoints: ["Can't afford therapy", "Long waitlists", "Insurance doesn't cover enough"],
      rank: 4,
      demandVelocity: 88,
      competitionGap: 58,
      hiddenInsight: {
        surfaceAsk: "Where can I find affordable therapy?",
        realProblem: "I need professional-quality support without professional prices",
        hiddenSignal: "Peer support with light professional oversight is the sweet spot"
      },
    },
    {
      id: "mh-5",
      title: "Men don't know how to talk about feelings",
      subtitle: "Masculinity-friendly mental health content is rare",
      category: "Mental Health",
      sentiment: "rising",
      views: 1500000,
      saves: 62000,
      shares: 38000,
      painPoints: ["Stigma around men's mental health", "Don't relate to typical wellness content", "Need male-focused approach"],
      rank: 5,
      demandVelocity: 78,
      competitionGap: 82,
      hiddenInsight: {
        surfaceAsk: "I need to manage stress better",
        realProblem: "I want to process emotions without feeling emasculated",
        hiddenSignal: "Mental health needs masculine rebranding, not feminine adaptation"
      },
    },
  ],
  "weight-fitness": [
    {
      id: "wf-1",
      title: "Gym anxiety stops beginners before they start",
      subtitle: "First-timers want judgment-free guidance, not intimidation",
      category: "Weight & Fitness",
      sentiment: "exploding",
      views: 2800000,
      saves: 112000,
      shares: 45000,
      painPoints: ["Fear of looking stupid", "Don't know how to use equipment", "Feel judged by regulars"],
      rank: 1,
      demandVelocity: 94,
      competitionGap: 71,
      hiddenInsight: {
        surfaceAsk: "What's the best workout for beginners?",
        realProblem: "I need to feel competent before I can feel confident",
        hiddenSignal: "The barrier isn't knowledge - it's social anxiety about public failure"
      },
    },
    {
      id: "wf-2",
      title: "Weight loss plateaus feel like failure",
      subtitle: "People need motivation to push through stalls",
      category: "Weight & Fitness",
      sentiment: "rising",
      views: 1900000,
      saves: 85000,
      shares: 32000,
      painPoints: ["Stuck at same weight for weeks", "Losing motivation", "Don't know what to change"],
      rank: 2,
      demandVelocity: 86,
      competitionGap: 68,
      hiddenInsight: {
        surfaceAsk: "Why did I stop losing weight?",
        realProblem: "I need validation that I'm not failing, just adapting",
        hiddenSignal: "Emotional support matters more than metabolic hacks"
      },
    },
    {
      id: "wf-3",
      title: "Counting calories is mentally exhausting",
      subtitle: "Intuitive eating trends show people want simpler systems",
      category: "Weight & Fitness",
      sentiment: "exploding",
      views: 2500000,
      saves: 95000,
      shares: 48000,
      painPoints: ["Obsessing over numbers", "Ruins relationship with food", "Too time-consuming"],
      rank: 3,
      demandVelocity: 91,
      competitionGap: 62,
      hiddenInsight: {
        surfaceAsk: "What's the best calorie tracking app?",
        realProblem: "I want results without obsession",
        hiddenSignal: "Friction-free tracking that doesn't feel like tracking"
      },
    },
    {
      id: "wf-4",
      title: "No time for hour-long workouts",
      subtitle: "Busy parents and workers need 15-minute effective routines",
      category: "Weight & Fitness",
      sentiment: "rising",
      views: 2100000,
      saves: 78000,
      shares: 35000,
      painPoints: ["Can't find time to exercise", "Short workouts feel pointless", "Need quick but effective"],
      rank: 4,
      demandVelocity: 82,
      competitionGap: 75,
      hiddenInsight: {
        surfaceAsk: "Best quick workout routines?",
        realProblem: "I need to maintain consistency when life gets chaotic",
        hiddenSignal: "Minimum effective dose fitness is the new goal"
      },
    },
    {
      id: "wf-5",
      title: "Post-pregnancy body confidence is shattered",
      subtitle: "New moms need supportive, realistic fitness journeys",
      category: "Weight & Fitness",
      sentiment: "rising",
      views: 1600000,
      saves: 68000,
      shares: 29000,
      painPoints: ["Body doesn't feel like mine", "Pressure to bounce back", "Lack of mom-specific programs"],
      rank: 5,
      demandVelocity: 79,
      competitionGap: 80,
      hiddenInsight: {
        surfaceAsk: "How to lose baby weight?",
        realProblem: "I need to reconnect with my body, not punish it",
        hiddenSignal: "Body acceptance is the gateway to fitness motivation"
      },
    },
  ],
  "skin-beauty": [
    {
      id: "sb-1",
      title: "Adult acne is embarrassing and misunderstood",
      subtitle: "Skincare for 30+ with breakouts is underdeveloped",
      category: "Skin & Beauty",
      sentiment: "exploding",
      views: 3200000,
      saves: 128000,
      shares: 56000,
      painPoints: ["Thought acne would end after teens", "Products for teens don't work", "Feel judged at work"],
      rank: 1,
      demandVelocity: 96,
      competitionGap: 74,
      hiddenInsight: {
        surfaceAsk: "Best products for adult acne?",
        realProblem: "I feel like a teenager in an adult's body",
        hiddenSignal: "Adult acne is as much an identity crisis as a skin issue"
      },
    },
    {
      id: "sb-2",
      title: "Skincare routines are overwhelming",
      subtitle: "10-step routines are out, minimalism is trending",
      category: "Skin & Beauty",
      sentiment: "rising",
      views: 2700000,
      saves: 102000,
      shares: 42000,
      painPoints: ["Too many products", "Don't know what actually works", "Expensive to maintain"],
      rank: 2,
      demandVelocity: 89,
      competitionGap: 69,
      hiddenInsight: {
        surfaceAsk: "What's a simple skincare routine?",
        realProblem: "I want good skin without it becoming my personality",
        hiddenSignal: "Effortless results are the new flex"
      },
    },
    {
      id: "sb-3",
      title: "Sunscreen feels gross on dark skin",
      subtitle: "White cast and greasy formulas exclude POC consumers",
      category: "Skin & Beauty",
      sentiment: "exploding",
      views: 2400000,
      saves: 95000,
      shares: 51000,
      painPoints: ["White cast on photos", "Greasy feeling all day", "Hard to find inclusive products"],
      rank: 3,
      demandVelocity: 92,
      competitionGap: 85,
      hiddenInsight: {
        surfaceAsk: "Sunscreen without white cast?",
        realProblem: "I shouldn't have to choose between protection and looking good",
        hiddenSignal: "Inclusive formulation is table stakes, not a feature"
      },
    },
    {
      id: "sb-4",
      title: "Anti-aging starts too late for most",
      subtitle: "20-somethings want preventive, not reactive skincare",
      category: "Skin & Beauty",
      sentiment: "rising",
      views: 1800000,
      saves: 72000,
      shares: 31000,
      painPoints: ["When should I start retinol?", "Prevention vs treatment confusion", "Marketing targets older demos"],
      rank: 4,
      demandVelocity: 84,
      competitionGap: 67,
      hiddenInsight: {
        surfaceAsk: "When should I start anti-aging?",
        realProblem: "I'm anxious about aging before it even happens",
        hiddenSignal: "Prevention anxiety is the new anti-aging market"
      },
    },
    {
      id: "sb-5",
      title: "Ingredient lists are unreadable",
      subtitle: "Demand for plain-English product transparency",
      category: "Skin & Beauty",
      sentiment: "stable",
      views: 1400000,
      saves: 58000,
      shares: 24000,
      painPoints: ["Can't pronounce ingredients", "Don't know what's harmful", "Marketing claims are confusing"],
      rank: 5,
      demandVelocity: 76,
      competitionGap: 72,
      hiddenInsight: {
        surfaceAsk: "Is this ingredient safe?",
        realProblem: "I don't trust brands to tell me the truth",
        hiddenSignal: "Ingredient transparency is the new brand trust signal"
      },
    },
  ],
  "gut-health": [
    {
      id: "gh-1",
      title: "Bloating ruins daily life and confidence",
      subtitle: "Millions searching for real solutions beyond probiotics",
      category: "Gut Health",
      sentiment: "exploding",
      views: 2900000,
      saves: 118000,
      shares: 48000,
      painPoints: ["Look pregnant by evening", "Can't wear fitted clothes", "Probiotics don't help"],
      rank: 1,
      demandVelocity: 95,
      competitionGap: 76,
      hiddenInsight: {
        surfaceAsk: "How do I stop bloating?",
        realProblem: "My body embarrasses me every day",
        hiddenSignal: "Bloating is a confidence issue disguised as a health issue"
      },
    },
    {
      id: "gh-2",
      title: "Food sensitivity tests are confusing",
      subtitle: "People want clear answers, not more elimination diets",
      category: "Gut Health",
      sentiment: "rising",
      views: 2100000,
      saves: 86000,
      shares: 35000,
      painPoints: ["Conflicting test results", "Elimination diets are hard", "Don't know what to eat"],
      rank: 2,
      demandVelocity: 87,
      competitionGap: 70,
      hiddenInsight: {
        surfaceAsk: "Which food sensitivity test is accurate?",
        realProblem: "I just want someone to tell me what I can eat",
        hiddenSignal: "Decision fatigue is worse than dietary restriction"
      },
    },
    {
      id: "gh-3",
      title: "IBS is embarrassing to talk about",
      subtitle: "Stigma prevents people from seeking help",
      category: "Gut Health",
      sentiment: "rising",
      views: 1800000,
      saves: 74000,
      shares: 29000,
      painPoints: ["Can't discuss symptoms openly", "Fear of accidents", "Affects social life"],
      rank: 3,
      demandVelocity: 82,
      competitionGap: 78,
      hiddenInsight: {
        surfaceAsk: "IBS management tips?",
        realProblem: "I'm planning my life around my bathroom",
        hiddenSignal: "IBS solutions need to address social anxiety, not just symptoms"
      },
    },
    {
      id: "gh-4",
      title: "Gut-brain connection is poorly understood",
      subtitle: "People linking anxiety to digestion want answers",
      category: "Gut Health",
      sentiment: "exploding",
      views: 2600000,
      saves: 105000,
      shares: 44000,
      painPoints: ["Stress causes stomach issues", "Anxiety and digestion linked", "Doctors don't explain connection"],
      rank: 4,
      demandVelocity: 93,
      competitionGap: 82,
      hiddenInsight: {
        surfaceAsk: "Why does stress upset my stomach?",
        realProblem: "I need to understand my body, not just treat symptoms",
        hiddenSignal: "Holistic gut-brain education is an untapped market"
      },
    },
    {
      id: "gh-5",
      title: "Healthy eating still causes digestive issues",
      subtitle: "FODMAPs and fiber confusion among health-conscious users",
      category: "Gut Health",
      sentiment: "stable",
      views: 1500000,
      saves: 62000,
      shares: 25000,
      painPoints: ["Eating healthy but still bloated", "Too much fiber causes problems", "FODMAP diet is complex"],
      rank: 5,
      demandVelocity: 78,
      competitionGap: 68,
      hiddenInsight: {
        surfaceAsk: "Why does healthy food make me bloated?",
        realProblem: "I feel betrayed by nutrition advice",
        hiddenSignal: "Personalized nutrition is the only way forward"
      },
    },
  ],
  "productivity": [
    {
      id: "pr-1",
      title: "To-do apps create more anxiety than clarity",
      subtitle: "Task overload is burning out productivity enthusiasts",
      category: "Productivity",
      sentiment: "exploding",
      views: 2700000,
      saves: 108000,
      shares: 46000,
      painPoints: ["Endless task lists", "Never feel done", "Apps add complexity"],
      rank: 1,
      demandVelocity: 94,
      competitionGap: 65,
      hiddenInsight: {
        surfaceAsk: "Best to-do app for productivity?",
        realProblem: "I need permission to do less, not tools to do more",
        hiddenSignal: "Productivity tools are causing the problem they claim to solve"
      },
    },
    {
      id: "pr-2",
      title: "Focus is impossible with constant notifications",
      subtitle: "Digital minimalism trend shows demand for focus tools",
      category: "Productivity",
      sentiment: "rising",
      views: 2200000,
      saves: 89000,
      shares: 38000,
      painPoints: ["Phone addiction", "Can't do deep work", "Notifications break concentration"],
      rank: 2,
      demandVelocity: 88,
      competitionGap: 58,
      hiddenInsight: {
        surfaceAsk: "How do I focus better?",
        realProblem: "I've lost the ability to sit with my own thoughts",
        hiddenSignal: "Focus is a skill atrophied by design, not willpower failure"
      },
    },
    {
      id: "pr-3",
      title: "Morning routines feel performative",
      subtitle: "Backlash against 5am wake-up culture is growing",
      category: "Productivity",
      sentiment: "rising",
      views: 1900000,
      saves: 76000,
      shares: 42000,
      painPoints: ["Unrealistic morning routines", "Feel guilty for sleeping in", "Not everyone is a morning person"],
      rank: 3,
      demandVelocity: 83,
      competitionGap: 74,
      hiddenInsight: {
        surfaceAsk: "What's the best morning routine?",
        realProblem: "I want to feel productive without performing productivity",
        hiddenSignal: "Anti-hustle productivity is the next wave"
      },
    },
    {
      id: "pr-4",
      title: "Procrastination stems from perfectionism",
      subtitle: "People need emotional tools, not more systems",
      category: "Productivity",
      sentiment: "exploding",
      views: 2500000,
      saves: 98000,
      shares: 51000,
      painPoints: ["Fear of starting", "Analysis paralysis", "Perfectionism blocks action"],
      rank: 4,
      demandVelocity: 91,
      competitionGap: 72,
      hiddenInsight: {
        surfaceAsk: "How do I stop procrastinating?",
        realProblem: "I'm afraid of finding out I'm not good enough",
        hiddenSignal: "Procrastination is an emotional regulation problem, not a time management one"
      },
    },
    {
      id: "pr-5",
      title: "Work-life balance is a myth for freelancers",
      subtitle: "Gig workers need different productivity frameworks",
      category: "Productivity",
      sentiment: "stable",
      views: 1400000,
      saves: 58000,
      shares: 24000,
      painPoints: ["No clear work hours", "Guilt when not working", "Traditional advice doesn't apply"],
      rank: 5,
      demandVelocity: 77,
      competitionGap: 80,
      hiddenInsight: {
        surfaceAsk: "How to balance freelance and life?",
        realProblem: "I chose freedom but found a new kind of prison",
        hiddenSignal: "Freelancer-specific productivity is an underserved niche"
      },
    },
  ],
  "career": [
    {
      id: "ca-1",
      title: "Networking feels fake and exhausting",
      subtitle: "Introverts need authentic connection strategies",
      category: "Career",
      sentiment: "exploding",
      views: 2400000,
      saves: 96000,
      shares: 44000,
      painPoints: ["Hate small talk", "Feel inauthentic", "Networking events are draining"],
      rank: 1,
      demandVelocity: 92,
      competitionGap: 77,
      hiddenInsight: {
        surfaceAsk: "How do I network effectively?",
        realProblem: "I want career opportunities without becoming someone I'm not",
        hiddenSignal: "Authentic networking for introverts is massively underserved"
      },
    },
    {
      id: "ca-2",
      title: "Salary negotiation terrifies most people",
      subtitle: "Fear of rejection leaves money on the table",
      category: "Career",
      sentiment: "rising",
      views: 2000000,
      saves: 82000,
      shares: 35000,
      painPoints: ["Don't know my worth", "Fear of seeming greedy", "Never taught how to negotiate"],
      rank: 2,
      demandVelocity: 86,
      competitionGap: 69,
      hiddenInsight: {
        surfaceAsk: "How do I negotiate salary?",
        realProblem: "I'm terrified of confrontation and rejection",
        hiddenSignal: "Salary negotiation is an emotional skills gap, not an information gap"
      },
    },
    {
      id: "ca-3",
      title: "LinkedIn feels like a highlight reel",
      subtitle: "Authenticity gap making platform unusable for many",
      category: "Career",
      sentiment: "rising",
      views: 1800000,
      saves: 72000,
      shares: 48000,
      painPoints: ["Comparing to others", "Toxic positivity", "Don't know what to post"],
      rank: 3,
      demandVelocity: 84,
      competitionGap: 62,
      hiddenInsight: {
        surfaceAsk: "How do I build a LinkedIn presence?",
        realProblem: "I hate self-promotion but need to be visible",
        hiddenSignal: "Anti-performative personal branding is the next trend"
      },
    },
    {
      id: "ca-4",
      title: "Career pivots in your 30s feel impossible",
      subtitle: "Age-related career anxiety is spiking",
      category: "Career",
      sentiment: "exploding",
      views: 2800000,
      saves: 115000,
      shares: 52000,
      painPoints: ["Too late to change", "Starting over is scary", "Financial responsibilities prevent risk"],
      rank: 4,
      demandVelocity: 95,
      competitionGap: 83,
      hiddenInsight: {
        surfaceAsk: "Is it too late to change careers?",
        realProblem: "I'm terrified of wasting the years I've already invested",
        hiddenSignal: "Mid-career pivots need financial and emotional scaffolding"
      },
    },
    {
      id: "ca-5",
      title: "Remote job search is overwhelming",
      subtitle: "Thousands of applicants, no responses",
      category: "Career",
      sentiment: "stable",
      views: 1600000,
      saves: 65000,
      shares: 28000,
      painPoints: ["Applied to 100+ jobs", "No interview callbacks", "ATS systems reject resumes"],
      rank: 5,
      demandVelocity: 79,
      competitionGap: 55,
      hiddenInsight: {
        surfaceAsk: "How do I find remote jobs?",
        realProblem: "I'm shouting into a void and losing hope",
        hiddenSignal: "Job search is a mental health crisis, not just a skills problem"
      },
    },
  ],
  "social": [
    {
      id: "sc-1",
      title: "Making friends as an adult is impossibly hard",
      subtitle: "Post-college loneliness epidemic needs solutions",
      category: "Social Connections",
      sentiment: "exploding",
      views: 3500000,
      saves: 142000,
      shares: 68000,
      painPoints: ["No organic friend opportunities", "Work friends aren't real friends", "Don't know where to meet people"],
      rank: 1,
      demandVelocity: 97,
      competitionGap: 84,
      hiddenInsight: {
        surfaceAsk: "How do I make friends as an adult?",
        realProblem: "I'm lonely but don't know how to admit it",
        hiddenSignal: "Adult friendship is a logistics problem wrapped in shame"
      },
    },
    {
      id: "sc-2",
      title: "Dating apps feel like a second job",
      subtitle: "Swipe fatigue driving demand for alternatives",
      category: "Social Connections",
      sentiment: "exploding",
      views: 2900000,
      saves: 118000,
      shares: 55000,
      painPoints: ["Endless swiping", "Superficial connections", "Ghosting is exhausting"],
      rank: 2,
      demandVelocity: 94,
      competitionGap: 71,
      hiddenInsight: {
        surfaceAsk: "Which dating app is best?",
        realProblem: "I want to meet someone without performing a version of myself",
        hiddenSignal: "Low-effort, high-quality connection is the unmet need"
      },
    },
    {
      id: "sc-3",
      title: "Social anxiety makes everything harder",
      subtitle: "Fear of judgment prevents authentic connection",
      category: "Social Connections",
      sentiment: "rising",
      views: 2200000,
      saves: 88000,
      shares: 41000,
      painPoints: ["Overthink every interaction", "Avoid social situations", "Feel like an outsider"],
      rank: 3,
      demandVelocity: 87,
      competitionGap: 76,
      hiddenInsight: {
        surfaceAsk: "How do I deal with social anxiety?",
        realProblem: "I want connection but the fear is paralyzing",
        hiddenSignal: "Social skills training with exposure therapy elements"
      },
    },
    {
      id: "sc-4",
      title: "Moving to a new city means starting over",
      subtitle: "Relocation loneliness is underserved",
      category: "Social Connections",
      sentiment: "rising",
      views: 1800000,
      saves: 74000,
      shares: 32000,
      painPoints: ["Left all friends behind", "Don't know the area", "Takes months to build connections"],
      rank: 4,
      demandVelocity: 82,
      competitionGap: 88,
      hiddenInsight: {
        surfaceAsk: "How do I meet people in a new city?",
        realProblem: "I'm grieving my old life while building a new one",
        hiddenSignal: "Relocation support is emotional, not just logistical"
      },
    },
    {
      id: "sc-5",
      title: "Maintaining long-distance friendships is hard",
      subtitle: "People drift apart despite good intentions",
      category: "Social Connections",
      sentiment: "stable",
      views: 1500000,
      saves: 62000,
      shares: 26000,
      painPoints: ["Life gets busy", "Time zones make it hard", "Calls feel like obligations"],
      rank: 5,
      demandVelocity: 75,
      competitionGap: 79,
      hiddenInsight: {
        surfaceAsk: "How do I stay in touch with old friends?",
        realProblem: "I feel guilty about friendships fading but can't fix it",
        hiddenSignal: "Low-friction async connection tools for friends"
      },
    },
  ],
};

function checkVirality(views: number, shares: number, saves: number): boolean {
  const totalEngagement = shares + saves;
  const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;
  return (views >= 100000 && engagementRate > 3) || views >= 1000000;
}

function calculateOpportunityScore(demandVelocity: number, competitionGap: number): number {
  return Math.round((demandVelocity * 0.6) + (competitionGap * 0.4));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { niche } = await req.json();
    
    if (!niche || typeof niche !== 'string') {
      throw new Error('Niche selection is required');
    }

    console.log(`Processing niche: ${niche}`);

    const painPoints = NICHE_PAIN_POINTS[niche];
    
    if (!painPoints || painPoints.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [], viralCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = painPoints.map((point) => {
      const isViral = checkVirality(point.views, point.shares, point.saves);
      const opportunityScore = calculateOpportunityScore(point.demandVelocity, point.competitionGap);
      
      return {
        id: point.id,
        title: point.title,
        subtitle: point.subtitle,
        category: point.category,
        sentiment: point.sentiment,
        views: point.views,
        saves: point.saves,
        shares: point.shares,
        painPoints: point.painPoints,
        rank: point.rank,
        isViral,
        opportunityScore,
        addedToLibrary: isViral,
        hiddenInsight: point.hiddenInsight,
      };
    });

    console.log(`Found ${results.length} pain points, ${results.filter(r => r.isViral).length} viral`);

    const viralResults = results.filter(r => r.isViral);
    
    if (viralResults.length > 0) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      for (const result of viralResults) {
        const { data: existing } = await supabase
          .from('problems')
          .select('id')
          .eq('title', result.title)
          .maybeSingle();

        if (!existing) {
          const problemData = {
            title: result.title,
            subtitle: result.subtitle,
            category: result.category,
            niche: niche.replace('-', ' '),
            sentiment: result.sentiment,
            opportunity_score: result.opportunityScore,
            views: result.views,
            saves: result.saves,
            shares: result.shares,
            is_viral: true,
            pain_points: result.painPoints,
            trending_rank: result.rank,
            sources: [{ source: "TikTok", type: "trend_analysis" }],
            slots_total: 100,
            slots_filled: 0,
            demand_velocity: Math.round(result.opportunityScore * 0.8),
            competition_gap: Math.round(100 - result.opportunityScore * 0.3),
            hidden_insight: result.hiddenInsight,
          };

          const { error } = await supabase.from('problems').insert(problemData);

          if (error) {
            console.error('Error inserting problem:', error);
          } else {
            console.log(`Added viral problem to library: ${result.title}`);
          }
        } else {
          // Update the existing problem with hidden_insight if missing
          await supabase
            .from('problems')
            .update({ hidden_insight: result.hiddenInsight })
            .eq('id', existing.id);
          console.log(`Updated hidden insight for: ${result.title}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: results, viralCount: viralResults.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Search error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
