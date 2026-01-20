import { TrendSource } from "./marketIntelligence";

export interface ChallengeSource {
  source: TrendSource;
  metric: string;
  value: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  trend: string;
  description: string;
  example: string;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  soloParticipants: number;
  teamCount: number;
  endsAt: Date;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  isToday: boolean;
  status: "active" | "voting" | "completed";
  winnerPrize: number;
  // New relevance fields
  whyRelevant: string;
  sources: ChallengeSource[];
  trendGrowth: string;
  audienceSize: string;
}

const ENTRY_FEE = 2;
const WINNER_PERCENTAGE = 0.9;

export const mockChallenges: DailyChallenge[] = [
  {
    id: "challenge-1",
    title: "Couple Conflict Resolver",
    trend: "Relationship Arguments",
    description: "Build an app that helps couples settle disputes fairly. Who's right? Let AI decide!",
    example: "Build a 'Couple Who Wins' app where each partner presents their case and AI picks a winner based on logic & fairness.",
    prizePool: 1000,
    participants: 10,
    maxParticipants: 200,
    soloParticipants: 7,
    teamCount: 1,
    endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    difficulty: "beginner",
    tags: ["AI", "Relationships", "Fun"],
    isToday: true,
    status: "active",
    winnerPrize: 900,
    whyRelevant: "Couples arguing about chores & decisions is trending on TikTok. 'Who's right' videos get millions of views. People want a neutral AI judge.",
    sources: [
      { source: "tiktok", metric: "Views this week", value: "12.4M" },
      { source: "google_trends", metric: "Search growth", value: "+340%" },
    ],
    trendGrowth: "+340%",
    audienceSize: "18-35 couples",
  },
  {
    id: "challenge-2",
    title: "Doom Scroll Detox",
    trend: "Screen Time Anxiety",
    description: "Create a tool that breaks the infinite scroll addiction with creative interventions.",
    example: "An app that detects doom scrolling and interrupts with breathing exercises or reality checks.",
    prizePool: 1000,
    participants: 10,
    maxParticipants: 200,
    soloParticipants: 7,
    teamCount: 1,
    endsAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    difficulty: "intermediate",
    tags: ["Wellness", "Productivity", "Mobile"],
    isToday: false,
    status: "voting",
    winnerPrize: 900,
    whyRelevant: "Screen time guilt is at an all-time high. Gen Z actively seeking dopamine detox solutions. Huge viral potential.",
    sources: [
      { source: "tiktok", metric: "Hashtag views", value: "8.2M" },
      { source: "google_trends", metric: "Search growth", value: "+180%" },
      { source: "reddit", metric: "Posts/week", value: "2.4K" },
    ],
    trendGrowth: "+180%",
    audienceSize: "Gen Z & Millennials",
  },
  {
    id: "challenge-3",
    title: "AI Outfit Judge",
    trend: "Fashion Insecurity",
    description: "Build an AI that honestly rates outfits before leaving the house.",
    example: "Upload a mirror selfie, get brutal AI fashion advice with suggestions from your own wardrobe.",
    prizePool: 1000,
    participants: 10,
    maxParticipants: 200,
    soloParticipants: 7,
    teamCount: 1,
    endsAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    difficulty: "advanced",
    tags: ["Fashion", "AI Vision", "Social"],
    isToday: false,
    status: "completed",
    winnerPrize: 900,
    whyRelevant: "'Rate my outfit' posts dominate social. AI fashion tools are exploding. People want honest feedback without asking friends.",
    sources: [
      { source: "tiktok", metric: "Creator videos", value: "45K" },
      { source: "google_trends", metric: "Search growth", value: "+420%" },
    ],
    trendGrowth: "+420%",
    audienceSize: "Fashion-conscious 16-28",
  },
  {
    id: "challenge-4",
    title: "Side Hustle Validator",
    trend: "Passive Income FOMO",
    description: "Create a reality-check tool for viral 'get rich' schemes.",
    example: "Paste a TikTok side hustle idea, get AI analysis of actual ROI, time investment, and success probability.",
    prizePool: 1000,
    participants: 10,
    maxParticipants: 200,
    soloParticipants: 7,
    teamCount: 1,
    endsAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    difficulty: "intermediate",
    tags: ["Finance", "AI", "Viral"],
    isToday: false,
    status: "completed",
    winnerPrize: 900,
    whyRelevant: "Fake 'get rich' content floods TikTok. Users are desperate to know what's real. Scam-busting content goes viral.",
    sources: [
      { source: "tiktok", metric: "Related hashtags", value: "28M views" },
      { source: "freelancer", metric: "Related gigs", value: "1.2K" },
      { source: "google_trends", metric: "Search growth", value: "+210%" },
    ],
    trendGrowth: "+210%",
    audienceSize: "Aspiring entrepreneurs",
  },
];

export const getTimeRemaining = (endsAt: Date): string => {
  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();
  
  if (diff <= 0) return "Ended";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
};

export const getDifficultyColor = (difficulty: DailyChallenge["difficulty"]): string => {
  switch (difficulty) {
    case "beginner":
      return "bg-success/10 text-success border-success/30";
    case "intermediate":
      return "bg-warning/10 text-warning border-warning/30";
    case "advanced":
      return "bg-destructive/10 text-destructive border-destructive/30";
  }
};
