import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  isActiveToday: boolean;
}

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: streakData, isLoading } = useQuery({
    queryKey: ["streak", user?.id],
    queryFn: async (): Promise<StreakData> => {
      if (!user) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          isActiveToday: false,
        };
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching streak:", error);
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          isActiveToday: false,
        };
      }

      const today = new Date().toISOString().split("T")[0];
      const isActiveToday = profile?.last_activity_date === today;

      return {
        currentStreak: profile?.current_streak || 0,
        longestStreak: profile?.longest_streak || 0,
        lastActivityDate: profile?.last_activity_date,
        isActiveToday,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const recordActivity = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("record_user_activity", {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data as { current_streak: number; longest_streak: number; is_new_record: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak", user?.id] });
    },
  });

  return {
    streakData: streakData || {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      isActiveToday: false,
    },
    isLoading,
    recordActivity: recordActivity.mutate,
    isRecording: recordActivity.isPending,
  };
}
