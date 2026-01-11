import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type JoinType = Database["public"]["Enums"]["join_type"];

interface ChallengeJoin {
  id: string;
  user_id: string;
  challenge_id: string;
  join_type: JoinType;
  team_name: string | null;
  created_at: string;
  updated_at: string;
}

export function useMyChallengeJoins() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["challenge_joins", "my", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("challenge_joins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching my challenge joins:", error);
        return [];
      }

      return data as ChallengeJoin[];
    },
    enabled: !!user,
  });
}

export function useChallengeJoin(challengeId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["challenge_joins", challengeId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("challenge_joins")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching challenge join:", error);
        return null;
      }

      return data as ChallengeJoin | null;
    },
    enabled: !!user && !!challengeId,
  });
}

interface JoinChallengeParams {
  challengeId: string;
  joinType: JoinType;
  teamName?: string;
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ challengeId, joinType, teamName }: JoinChallengeParams) => {
      if (!user) throw new Error("Must be authenticated to join challenge");

      const { data, error } = await supabase
        .from("challenge_joins")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          join_type: joinType,
          team_name: teamName || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error joining challenge:", error);
        throw new Error(error.message);
      }

      return data as ChallengeJoin;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["challenge_joins"] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge", data.challenge_id] });
    },
  });
}

export function useLeaveChallenge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("Must be authenticated to leave challenge");

      const { error } = await supabase
        .from("challenge_joins")
        .delete()
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId);

      if (error) {
        console.error("Error leaving challenge:", error);
        throw new Error(error.message);
      }

      return challengeId;
    },
    onSuccess: (challengeId) => {
      queryClient.invalidateQueries({ queryKey: ["challenge_joins"] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge", challengeId] });
    },
  });
}
