import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface RankingWithDetails {
  id: string;
  challenge_id: string;
  submission_id: string;
  user_id: string;
  rank: number;
  previous_rank: number | null;
  total_score: number;
  sentiment_fit_score: number;
  problem_coverage_score: number;
  revenue_score: number;
  github_score: number;
  bonus_score: number;
  is_winner: boolean;
  prize_won: number;
  created_at: string;
  updated_at: string;
  submission?: {
    product_name: string;
    product_url: string;
  } | null;
}

export function useRankings(challengeId: string) {
  return useQuery({
    queryKey: ["rankings", challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rankings")
        .select(`
          *,
          submission:submissions(product_name, product_url)
        `)
        .eq("challenge_id", challengeId)
        .order("rank", { ascending: true });

      if (error) {
        console.error("Error fetching rankings:", error);
        return [];
      }

      return data as unknown as RankingWithDetails[];
    },
    enabled: !!challengeId,
  });
}

export function useTopBuilders(limit: number = 10) {
  return useQuery({
    queryKey: ["rankings", "top", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rankings")
        .select(`
          *,
          challenge:challenges(title)
        `)
        .order("total_score", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching top builders:", error);
        return [];
      }

      return data;
    },
  });
}
