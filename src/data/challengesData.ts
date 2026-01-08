export interface DailyChallenge {
  id: string;
  title: string;
  trend: string;
  description: string;
  example: string;
  prizePool: number;
  participants: number;
  soloParticipants: number;
  teamCount: number;
  endsAt: Date;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  isToday: boolean;
  status: "active" | "voting" | "completed";
  winnerPrize: number; // 90% of pool
}

export const mockChallenges: DailyChallenge[] = [
  {
    id: "challenge-1",
    title: "Couple Conflict Resolver",
    trend: "Relationship Arguments",
    description: "Build an app that helps couples settle disputes fairly. Who's right? Let AI decide!",
    example: "Build a 'Couple Who Wins' app where each partner presents their case and AI picks a winner based on logic & fairness.",
    prizePool: 127,
    participants: 127,
    soloParticipants: 89,
    teamCount: 12,
    endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    difficulty: "beginner",
    tags: ["AI", "Relationships", "Fun"],
    isToday: true,
    status: "active",
    winnerPrize: 114.30, // 90%
  },
  {
    id: "challenge-2",
    title: "Doom Scroll Detox",
    trend: "Screen Time Anxiety",
    description: "Create a tool that breaks the infinite scroll addiction with creative interventions.",
    example: "An app that detects doom scrolling and interrupts with breathing exercises or reality checks.",
    prizePool: 89,
    participants: 89,
    soloParticipants: 62,
    teamCount: 8,
    endsAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Ended 2 hours ago
    difficulty: "intermediate",
    tags: ["Wellness", "Productivity", "Mobile"],
    isToday: false,
    status: "voting",
    winnerPrize: 80.10,
  },
  {
    id: "challenge-3",
    title: "AI Outfit Judge",
    trend: "Fashion Insecurity",
    description: "Build an AI that honestly rates outfits before leaving the house.",
    example: "Upload a mirror selfie, get brutal AI fashion advice with suggestions from your own wardrobe.",
    prizePool: 156,
    participants: 156,
    soloParticipants: 98,
    teamCount: 18,
    endsAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    difficulty: "advanced",
    tags: ["Fashion", "AI Vision", "Social"],
    isToday: false,
    status: "completed",
    winnerPrize: 140.40,
  },
  {
    id: "challenge-4",
    title: "Side Hustle Validator",
    trend: "Passive Income FOMO",
    description: "Create a reality-check tool for viral 'get rich' schemes.",
    example: "Paste a TikTok side hustle idea, get AI analysis of actual ROI, time investment, and success probability.",
    prizePool: 203,
    participants: 203,
    soloParticipants: 145,
    teamCount: 19,
    endsAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    difficulty: "intermediate",
    tags: ["Finance", "AI", "Viral"],
    isToday: false,
    status: "completed",
    winnerPrize: 182.70,
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
