import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useVerifiedBuilders(userIds?: string[]) {
  return useQuery({
    queryKey: ["verified-builders", userIds],
    queryFn: async () => {
      if (!userIds || userIds.length === 0) {
        return new Set<string>();
      }

      const { data, error } = await supabase
        .from("builder_verifications")
        .select("user_id")
        .eq("verification_status", "verified")
        .in("user_id", userIds);

      if (error) {
        console.error("Error fetching verified builders:", error);
        return new Set<string>();
      }

      return new Set(data.map((v) => v.user_id));
    },
    enabled: !!userIds && userIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useIsVerifiedBuilder(userId?: string) {
  return useQuery({
    queryKey: ["verified-builder", userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from("builder_verifications")
        .select("verification_status")
        .eq("user_id", userId)
        .eq("verification_status", "verified")
        .maybeSingle();

      if (error) {
        console.error("Error checking verification status:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
