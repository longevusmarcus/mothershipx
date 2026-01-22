import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface UserBuild {
  id: string;
  name: string;
  problem: string;
  problemId: string | null;
  status: "pending" | "validated" | "ranked" | "winner";
  fitScore: number;
  adoption: number;
  revenue: string;
  rank: number | null;
  url: string | null;
  github: string | null;
  createdAt: string;
}

export function useUserBuilds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-builds", user?.id],
    queryFn: async (): Promise<UserBuild[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id,
          product_name,
          product_url,
          github_repo,
          status,
          sentiment_fit_score,
          revenue_amount,
          has_revenue,
          problem_id,
          created_at,
          problems:problem_id (
            title
          ),
          rankings (
            rank
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user builds:", error);
        return [];
      }

      return (data || []).map((submission: any) => ({
        id: submission.id,
        name: submission.product_name,
        problem: submission.problems?.title || "Unknown Problem",
        problemId: submission.problem_id,
        status: submission.status,
        fitScore: submission.sentiment_fit_score || 0,
        adoption: 0, // Would need a separate analytics table
        revenue: submission.has_revenue && submission.revenue_amount 
          ? `$${(submission.revenue_amount / 100).toLocaleString()}` 
          : "$0",
        rank: submission.rankings?.[0]?.rank || null,
        url: submission.product_url,
        github: submission.github_repo,
        createdAt: submission.created_at,
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserBuildStats() {
  const { data: builds = [], isLoading } = useUserBuilds();

  const stats = {
    totalBuilds: builds.length,
    liveBuilds: builds.filter(b => b.status === "validated" || b.status === "ranked" || b.status === "winner").length,
    totalRevenue: builds.reduce((sum, b) => {
      const amount = parseInt(b.revenue.replace(/[$,]/g, "")) || 0;
      return sum + amount;
    }, 0),
    avgFitScore: builds.length > 0 
      ? Math.round(builds.reduce((sum, b) => sum + b.fitScore, 0) / builds.length)
      : 0,
  };

  return { stats, isLoading };
}
