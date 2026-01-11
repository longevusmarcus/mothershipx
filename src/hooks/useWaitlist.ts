import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

type WaitlistFeature = "builds" | "leaderboard" | "general";

interface WaitlistEntry {
  id: string;
  email: string;
  feature: WaitlistFeature;
  user_id: string | null;
  created_at: string;
}

export function useWaitlistStatus(feature: WaitlistFeature) {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["waitlist", feature, user?.id, profile?.email],
    queryFn: async () => {
      const email = profile?.email || user?.email;
      if (!email) return null;

      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .eq("email", email)
        .eq("feature", feature)
        .maybeSingle();

      if (error) {
        console.error("Error checking waitlist status:", error);
        return null;
      }

      return data as WaitlistEntry | null;
    },
    enabled: !!(profile?.email || user?.email),
  });
}

export function useJoinWaitlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ email, feature }: { email: string; feature: WaitlistFeature }) => {
      const { data, error } = await supabase
        .from("waitlist")
        .insert({
          email,
          feature,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (error) {
        // Check if already on waitlist
        if (error.message.includes("duplicate")) {
          throw new Error("You're already on the waitlist!");
        }
        throw new Error(error.message);
      }

      return data as WaitlistEntry;
    },
    onSuccess: (_, variables) => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["waitlist", variables.feature] });
    },
  });

  return {
    ...mutation,
    isSuccess,
    reset: () => {
      mutation.reset();
      setIsSuccess(false);
    },
  };
}

export function useWaitlistCount(feature: WaitlistFeature) {
  return useQuery({
    queryKey: ["waitlist", "count", feature],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .eq("feature", feature);

      if (error) {
        console.error("Error fetching waitlist count:", error);
        return 0;
      }

      return count || 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
