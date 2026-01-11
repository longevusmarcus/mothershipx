import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface UserStats {
  problemsJoined: number;
  solutionsShipped: number;
  totalXp: number;
  xpToNextLevel: number;
  currentLevel: number;
  averageFitScore: number | null;
  globalRank: number | null;
  challengesEntered: number;
  challengesWon: number;
  totalPrizeWon: number;
}

// XP rewards for different activities
const XP_REWARDS = {
  PROBLEM_JOINED: 50,
  SOLUTION_SUBMITTED: 100,
  CHALLENGE_ENTERED: 75,
  CHALLENGE_WON: 500,
  HIGH_FIT_SCORE: 25, // Per 10% above 70%
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0,      // Level 1: 0 XP
  500,    // Level 2: 500 XP
  1500,   // Level 3: 1500 XP
  3000,   // Level 4: 3000 XP
  5000,   // Level 5: 5000 XP
  8000,   // Level 6: 8000 XP
  12000,  // Level 7: 12000 XP
  18000,  // Level 8: 18000 XP
  25000,  // Level 9: 25000 XP
  35000,  // Level 10: 35000 XP
];

function calculateLevel(xp: number): { level: number; xpToNext: number; currentLevelXp: number; nextLevelXp: number } {
  let level = 1;
  
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
  const xpToNext = nextLevelXp - xp;
  
  return { level, xpToNext, currentLevelXp, nextLevelXp };
}

export function useUserStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userStats", user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user) {
        return {
          problemsJoined: 0,
          solutionsShipped: 0,
          totalXp: 0,
          xpToNextLevel: 500,
          currentLevel: 1,
          averageFitScore: null,
          globalRank: null,
          challengesEntered: 0,
          challengesWon: 0,
          totalPrizeWon: 0,
        };
      }

      // Fetch all stats in parallel
      const [
        problemBuildersResult,
        solutionsResult,
        submissionsResult,
        challengeJoinsResult,
        rankingsResult,
      ] = await Promise.all([
        // Count problems joined
        supabase
          .from("problem_builders")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        
        // Count solutions created
        supabase
          .from("solutions")
          .select("id, market_fit", { count: "exact" })
          .eq("created_by", user.id),
        
        // Get submissions with scores
        supabase
          .from("submissions")
          .select("id, total_score, sentiment_fit_score, status")
          .eq("user_id", user.id),
        
        // Count challenge entries
        supabase
          .from("challenge_joins")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        
        // Get rankings (wins)
        supabase
          .from("rankings")
          .select("id, is_winner, prize_won, rank")
          .eq("user_id", user.id),
      ]);

      const problemsJoined = problemBuildersResult.count || 0;
      const solutionsCount = solutionsResult.count || 0;
      const solutions = solutionsResult.data || [];
      const submissions = submissionsResult.data || [];
      const challengesEntered = challengeJoinsResult.count || 0;
      const rankings = rankingsResult.data || [];

      // Calculate solutions shipped (validated submissions + created solutions)
      const validatedSubmissions = submissions.filter(s => s.status === "validated" || s.status === "ranked" || s.status === "winner").length;
      const solutionsShipped = solutionsCount + validatedSubmissions;

      // Calculate average fit score from submissions
      const scoresWithFit = submissions.filter(s => s.sentiment_fit_score !== null);
      const averageFitScore = scoresWithFit.length > 0
        ? Math.round(scoresWithFit.reduce((sum, s) => sum + (s.sentiment_fit_score || 0), 0) / scoresWithFit.length)
        : null;

      // Calculate wins and prizes
      const wins = rankings.filter(r => r.is_winner);
      const challengesWon = wins.length;
      const totalPrizeWon = rankings.reduce((sum, r) => sum + (r.prize_won || 0), 0);

      // Calculate total XP
      let totalXp = 0;
      totalXp += problemsJoined * XP_REWARDS.PROBLEM_JOINED;
      totalXp += solutionsShipped * XP_REWARDS.SOLUTION_SUBMITTED;
      totalXp += challengesEntered * XP_REWARDS.CHALLENGE_ENTERED;
      totalXp += challengesWon * XP_REWARDS.CHALLENGE_WON;
      
      // Bonus XP for high fit scores
      scoresWithFit.forEach(s => {
        const score = s.sentiment_fit_score || 0;
        if (score > 70) {
          const bonusMultiplier = Math.floor((score - 70) / 10);
          totalXp += bonusMultiplier * XP_REWARDS.HIGH_FIT_SCORE;
        }
      });

      const { level, xpToNext, nextLevelXp } = calculateLevel(totalXp);

      return {
        problemsJoined,
        solutionsShipped,
        totalXp,
        xpToNextLevel: xpToNext,
        currentLevel: level,
        averageFitScore,
        globalRank: null, // Coming soon - would need global leaderboard calculation
        challengesEntered,
        challengesWon,
        totalPrizeWon,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get XP progress percentage for progress bar
export function getXpProgress(totalXp: number): { percentage: number; currentLevelXp: number; nextLevelXp: number } {
  const { currentLevelXp, nextLevelXp } = calculateLevel(totalXp);
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const percentage = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));
  
  return { percentage, currentLevelXp, nextLevelXp };
}

// Get level title based on level
export function getLevelTitle(level: number): string {
  const titles = [
    "Newcomer",      // 1
    "Explorer",      // 2
    "Builder",       // 3
    "Craftsman",     // 4
    "Artisan",       // 5
    "Expert",        // 6
    "Master",        // 7
    "Grandmaster",   // 8
    "Legend",        // 9
    "Elite",         // 10
  ];
  return titles[Math.min(level - 1, titles.length - 1)] || "Builder";
}