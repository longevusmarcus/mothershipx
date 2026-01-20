import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface BuilderVerification {
  id: string;
  user_id: string;
  github_username: string | null;
  stripe_public_key: string | null;
  supabase_project_key: string | null;
  verification_status: string;
  verification_result: {
    github?: {
      valid: boolean;
      username: string;
      hasStarredRepos: boolean;
      totalStars: number;
      topRepos: { name: string; stars: number }[];
      message: string;
    };
    stripe?: {
      valid: boolean;
      keyFormat: boolean;
      hasRevenue?: boolean;
      message: string;
    };
    supabase?: {
      valid: boolean;
      keyFormat: boolean;
      message: string;
    };
    overall?: {
      verified: boolean;
      score: number;
      message: string;
    };
  } | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useBuilderVerification() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["builder-verification", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("builder_verifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching builder verification:", error);
        return null;
      }

      return data as BuilderVerification | null;
    },
    enabled: !!user?.id,
  });
}

export function useIsBuilderVerified() {
  const { data: verification, isLoading } = useBuilderVerification();

  return {
    isVerified: verification?.verification_status === "verified",
    isLoading,
    verification,
  };
}
