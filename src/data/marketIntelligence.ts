// Market Intelligence Data - Simulating TikTok, Google Trends, Freelancer sources
// Focus niches: mental health, obesity, skin, gut, productivity, career development, real connections

export type TrendSource = "tiktok" | "google_trends" | "freelancer" | "reddit" | "hackernews";
export type TrendSentiment = "exploding" | "rising" | "stable" | "declining";

export interface TrendSignal {
  source: TrendSource;
  metric: string;
  value: string;
  change: number;
  icon?: string;
}

export interface HiddenInsight {
  surfaceAsk: string;
  realProblem: string;
  hiddenSignal: string;
}

export interface MarketProblem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  niche: string;
  sentiment: TrendSentiment;
  
  // Opportunity metrics
  opportunityScore: number;
  marketSize: string;
  demandVelocity: number;
  competitionGap: number;
  
  // Social proof (TikTok-style)
  views: number;
  saves: number;
  shares: number;
  trendingRank?: number;
  isViral?: boolean;
  
  // Builder metrics
  slotsTotal: number;
  slotsFilled: number;
  activeBuildersLast24h: number;
  
  // Sources & signals
  sources: TrendSignal[];
  painPoints: string[];
  hiddenInsight: HiddenInsight;
  
  // Timestamps
  discoveredAt: string;
  lastUpdated: string;
  peakPrediction?: string;
}

export const categories = [
  "All",
  "Mental Health",
  "Weight & Fitness", 
  "Skin & Beauty",
  "Gut Health",
  "Productivity",
  "Career",
  "Connections"
];

export const mockMarketProblems: MarketProblem[] = [
  {
    id: "mh-001",
    title: "Anxiety apps feel clinical, not human",
    subtitle: "Gen Z wants vibe-based mental wellness, not therapy-lite",
    category: "Mental Health",
    niche: "mental-health",
    sentiment: "exploding",
    
    opportunityScore: 94,
    marketSize: "$4.2B",
    demandVelocity: 156,
    competitionGap: 72,
    
    views: 2400000,
    saves: 89000,
    shares: 34000,
    trendingRank: 1,
    isViral: true,
    
    slotsTotal: 25,
    slotsFilled: 8,
    activeBuildersLast24h: 5,
    
    sources: [
      { source: "tiktok", metric: "Videos", value: "847K", change: 234, icon: "🎵" },
      { source: "google_trends", metric: "Search Volume", value: "89/100", change: 45, icon: "📈" },
      { source: "reddit", metric: "Mentions", value: "12.4K", change: 67, icon: "💬" },
    ],
    
    painPoints: [
      "Meditation apps feel like homework",
      "CBT exercises are too 'textbook'",
      "Want something that matches my aesthetic/vibe",
      "Need quick 2-min resets, not 20-min sessions",
    ],
    
    hiddenInsight: {
      surfaceAsk: "I need a better meditation app",
      realProblem: "I want emotional regulation that doesn't feel like I'm broken",
      hiddenSignal: "Mental wellness is becoming lifestyle content, not healthcare",
    },
    
    discoveredAt: "2026-01-02",
    lastUpdated: "2026-01-07T10:30:00Z",
    peakPrediction: "Feb 2026",
  },
  {
    id: "ob-001",
    title: "GLP-1 users need habit stacking support",
    subtitle: "Ozempic/Wegovy users struggle to build sustainable habits during treatment",
    category: "Weight & Fitness",
    niche: "obesity",
    sentiment: "exploding",
    
    opportunityScore: 91,
    marketSize: "$8.1B",
    demandVelocity: 189,
    competitionGap: 85,
    
    views: 5200000,
    saves: 156000,
    shares: 78000,
    trendingRank: 2,
    isViral: true,
    
    slotsTotal: 30,
    slotsFilled: 12,
    activeBuildersLast24h: 8,
    
    sources: [
      { source: "tiktok", metric: "Videos", value: "2.1M", change: 312, icon: "🎵" },
      { source: "google_trends", metric: "Search Volume", value: "94/100", change: 78, icon: "📈" },
      { source: "freelancer", metric: "Job Posts", value: "234", change: 156, icon: "💼" },
    ],
    
    painPoints: [
      "Lost weight but don't know how to eat 'normally'",
      "No energy for gym, need low-effort movement",
      "Food noise is gone but so is all food joy",
      "Scared of regaining when I stop medication",
    ],
    
    hiddenInsight: {
      surfaceAsk: "I need a meal plan for Ozempic users",
      realProblem: "I need to rebuild my entire relationship with food and movement",
      hiddenSignal: "GLP-1 is creating a new category: metabolic rehabilitation",
    },
    
    discoveredAt: "2026-01-01",
    lastUpdated: "2026-01-07T09:15:00Z",
    peakPrediction: "Mar 2026",
  },
  {
    id: "sk-001",
    title: "Ingredient-checking is exhausting",
    subtitle: "Skincare-obsessed users want AI to decode products instantly",
    category: "Skin & Beauty",
    niche: "skin",
    sentiment: "rising",
    
    opportunityScore: 87,
    marketSize: "$2.8B",
    demandVelocity: 98,
    competitionGap: 65,
    
    views: 890000,
    saves: 45000,
    shares: 21000,
    trendingRank: 5,
    
    slotsTotal: 20,
    slotsFilled: 6,
    activeBuildersLast24h: 3,
    
    sources: [
      { source: "tiktok", metric: "Videos", value: "456K", change: 89, icon: "🎵" },
      { source: "google_trends", metric: "Search Volume", value: "72/100", change: 34, icon: "📈" },
      { source: "reddit", metric: "r/SkincareAddiction", value: "8.9K", change: 45, icon: "💬" },
    ],
    
    painPoints: [
      "Can't remember which ingredients conflict",
      "Every product has 30+ ingredients to research",
      "Don't trust influencer recommendations anymore",
      "My skin type changes seasonally",
    ],
    
    hiddenInsight: {
      surfaceAsk: "Is this product good for acne?",
      realProblem: "I need a trusted filter for an overwhelming market",
      hiddenSignal: "Beauty consumers want evidence-based curation, not more options",
    },
    
    discoveredAt: "2026-01-03",
    lastUpdated: "2026-01-07T11:00:00Z",
  },
  {
    id: "gt-001",
    title: "Gut health feels like pseudoscience",
    subtitle: "People want gut-brain connection tools that actually work",
    category: "Gut Health",
    niche: "gut",
    sentiment: "rising",
    
    opportunityScore: 82,
    marketSize: "$1.9B",
    demandVelocity: 76,
    competitionGap: 78,
    
    views: 1200000,
    saves: 67000,
    shares: 28000,
    trendingRank: 4,
    
    slotsTotal: 15,
    slotsFilled: 4,
    activeBuildersLast24h: 2,
    
    sources: [
      { source: "tiktok", metric: "Videos", value: "678K", change: 112, icon: "🎵" },
      { source: "google_trends", metric: "Search Volume", value: "68/100", change: 28, icon: "📈" },
      { source: "hackernews", metric: "Discussions", value: "89", change: 34, icon: "🔥" },
    ],
    
    painPoints: [
      "Too many supplements, no clear protocol",
      "Bloating tracking apps are too manual",
      "Want to understand my triggers without elimination diets",
      "Probiotics feel like a lottery",
    ],
    
    hiddenInsight: {
      surfaceAsk: "Which probiotic should I take?",
      realProblem: "I want personalized gut optimization without becoming a biohacker",
      hiddenSignal: "Gut health is the next frontier of personalized wellness",
    },
    
    discoveredAt: "2026-01-04",
    lastUpdated: "2026-01-07T08:45:00Z",
  },
  {
    id: "pr-001",
    title: "Focus apps don't understand context switching",
    subtitle: "Knowledge workers need flow protection, not just timers",
    category: "Productivity",
    niche: "productivity",
    sentiment: "rising",
    
    opportunityScore: 85,
    marketSize: "$6.2B",
    demandVelocity: 67,
    competitionGap: 45,
    
    views: 780000,
    saves: 56000,
    shares: 19000,
    trendingRank: 6,
    
    slotsTotal: 25,
    slotsFilled: 18,
    activeBuildersLast24h: 4,
    
    sources: [
      { source: "tiktok", metric: "Videos", value: "234K", change: 45, icon: "🎵" },
      { source: "reddit", metric: "r/productivity", value: "15.6K", change: 23, icon: "💬" },
      { source: "freelancer", metric: "Tool Requests", value: "456", change: 89, icon: "💼" },
    ],
    
    painPoints: [
      "Pomodoro doesn't work for creative work",
      "My calendar is lies—meetings bleed into focus time",
      "Notifications are the enemy but I can't go dark",
      "Energy management > time management",
    ],
    
    hiddenInsight: {
      surfaceAsk: "I need a better focus app",
      realProblem: "I need protection from my environment, not self-discipline tools",
      hiddenSignal: "Productivity is shifting from optimization to boundary enforcement",
    },
    
    discoveredAt: "2026-01-05",
    lastUpdated: "2026-01-07T12:00:00Z",
  },
  {
    id: "cr-001",
    title: "Career pivots feel impossible after 30",
    subtitle: "Mid-career professionals need skill translation, not job boards",
    category: "Career",
    niche: "career",
    sentiment: "stable",
    
    opportunityScore: 79,
    marketSize: "$3.4B",
    demandVelocity: 54,
    competitionGap: 68,
    
    views: 450000,
    saves: 89000,
    shares: 34000,
    
    slotsTotal: 20,
    slotsFilled: 11,
    activeBuildersLast24h: 3,
    
    sources: [
      { source: "tiktok", metric: "Videos", value: "312K", change: 67, icon: "🎵" },
      { source: "google_trends", metric: "Search Volume", value: "61/100", change: 12, icon: "📈" },
      { source: "freelancer", metric: "Career Coaching", value: "789", change: 34, icon: "💼" },
    ],
    
    painPoints: [
      "LinkedIn is performative, not helpful",
      "Resume doesn't show transferable skills",
      "Don't know what I'm qualified for anymore",
      "Afraid to start over at lower salary",
    ],
    
    hiddenInsight: {
      surfaceAsk: "How do I update my resume?",
      realProblem: "I need someone to see my potential, not my job titles",
      hiddenSignal: "Career transition is an identity crisis, not a logistics problem",
    },
    
    discoveredAt: "2026-01-03",
    lastUpdated: "2026-01-07T10:00:00Z",
  },
  {
    id: "cn-001",
    title: "Dating apps killed spontaneous connection",
    subtitle: "People crave IRL meetups but don't know how to start",
    category: "Connections",
    niche: "connections",
    sentiment: "exploding",
    
    opportunityScore: 88,
    marketSize: "$5.1B",
    demandVelocity: 134,
    competitionGap: 82,
    
    views: 3100000,
    saves: 178000,
    shares: 92000,
    trendingRank: 3,
    isViral: true,
    
    slotsTotal: 20,
    slotsFilled: 7,
    activeBuildersLast24h: 6,
    
    sources: [
      { source: "tiktok", metric: "Videos", value: "1.4M", change: 189, icon: "🎵" },
      { source: "google_trends", metric: "Search Volume", value: "81/100", change: 56, icon: "📈" },
      { source: "reddit", metric: "r/dating", value: "23.4K", change: 78, icon: "💬" },
    ],
    
    painPoints: [
      "App fatigue is real—swiping feels like a job",
      "Want to meet people but not 'go out'",
      "Third places are disappearing",
      "Making friends as an adult is harder than dating",
    ],
    
    hiddenInsight: {
      surfaceAsk: "Which dating app should I use?",
      realProblem: "I want organic connection without the performance pressure",
      hiddenSignal: "The loneliness epidemic is creating demand for structured serendipity",
    },
    
    discoveredAt: "2026-01-01",
    lastUpdated: "2026-01-07T11:30:00Z",
    peakPrediction: "Feb 2026",
  },
  {
    id: "mh-002",
    title: "ADHD tools ignore emotional dysregulation",
    subtitle: "Beyond task management—ADHD brains need emotional co-regulation",
    category: "Mental Health",
    niche: "mental-health",
    sentiment: "rising",
    
    opportunityScore: 86,
    marketSize: "$2.1B",
    demandVelocity: 89,
    competitionGap: 76,
    
    views: 1800000,
    saves: 123000,
    shares: 67000,
    trendingRank: 7,
    
    slotsTotal: 15,
    slotsFilled: 9,
    activeBuildersLast24h: 4,
    
    sources: [
      { source: "tiktok", metric: "Videos", value: "567K", change: 123, icon: "🎵" },
      { source: "reddit", metric: "r/ADHD", value: "34.5K", change: 89, icon: "💬" },
      { source: "google_trends", metric: "Search Volume", value: "76/100", change: 34, icon: "📈" },
    ],
    
    painPoints: [
      "To-do apps make me feel worse, not better",
      "Rejection sensitivity spirals ruin my day",
      "Need body doubling but can't always find people",
      "Medication helps focus but not emotional storms",
    ],
    
    hiddenInsight: {
      surfaceAsk: "What's the best ADHD planner?",
      realProblem: "I need emotional scaffolding, not more productivity hacks",
      hiddenSignal: "ADHD community is redefining the condition as neurotype, not disorder",
    },
    
    discoveredAt: "2026-01-02",
    lastUpdated: "2026-01-07T09:00:00Z",
  },
];

// Helper functions
export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
  return views.toString();
}

export function getSourceIcon(source: TrendSource): string {
  const icons: Record<TrendSource, string> = {
    tiktok: "🎵",
    google_trends: "📈",
    freelancer: "💼",
    reddit: "💬",
    hackernews: "🔥",
  };
  return icons[source];
}

export function getSourceLabel(source: TrendSource): string {
  const labels: Record<TrendSource, string> = {
    tiktok: "TikTok",
    google_trends: "Google Trends",
    freelancer: "Freelancer",
    reddit: "Reddit",
    hackernews: "Hacker News",
  };
  return labels[source];
}

export function getSentimentColor(sentiment: TrendSentiment): string {
  const colors: Record<TrendSentiment, string> = {
    exploding: "text-destructive",
    rising: "text-success",
    stable: "text-warning",
    declining: "text-muted-foreground",
  };
  return colors[sentiment];
}

export function getSentimentLabel(sentiment: TrendSentiment): string {
  const labels: Record<TrendSentiment, string> = {
    exploding: "🔥 Exploding",
    rising: "📈 Rising",
    stable: "➡️ Stable",
    declining: "📉 Declining",
  };
  return labels[sentiment];
}
