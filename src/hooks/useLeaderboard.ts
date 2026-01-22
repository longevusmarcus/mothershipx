import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  solutions: number;
  fitScore: number;
  streak: number;
  change?: string;
}

export function useLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      // Get users with their submission stats
      // We aggregate by user: count submissions, avg fit score, sum of ranking scores
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          avatar_url,
          current_streak,
          submissions:submissions (
            id,
            sentiment_fit_score,
            total_score,
            status
          )
        `)
        .not("name", "is", null)
        .limit(50); // Get more to filter

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
      }

      // Calculate scores and rank
      const leaderboard = (data || [])
        .map((profile: any) => {
          const submissions = profile.submissions || [];
          const validatedSubmissions = submissions.filter(
            (s: any) => s.status === "validated" || s.status === "ranked" || s.status === "winner"
          );
          
          const totalScore = submissions.reduce((sum: number, s: any) => sum + (s.total_score || 0), 0);
          const avgFitScore = validatedSubmissions.length > 0
            ? Math.round(
                validatedSubmissions.reduce((sum: number, s: any) => sum + (s.sentiment_fit_score || 0), 0) / 
                validatedSubmissions.length
              )
            : 0;

          return {
            userId: profile.id,
            name: profile.name || "Anonymous",
            avatar: (profile.name || "A")[0].toUpperCase(),
            score: totalScore,
            solutions: validatedSubmissions.length,
            fitScore: avgFitScore,
            streak: profile.current_streak || 0,
          };
        })
        .filter((entry) => entry.solutions > 0 || entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return leaderboard;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useTopBuilders() {
  const { data: leaderboard = [], isLoading, error } = useLeaderboard(10);
  
  // Top 3 for podium
  const topThree = leaderboard.slice(0, 3);
  
  // Rest for the table
  const rest = leaderboard.slice(3);

  return {
    topThree,
    rest,
    isLoading,
    error,
    isEmpty: leaderboard.length === 0,
  };
}
