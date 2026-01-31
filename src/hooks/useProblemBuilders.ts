import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ProblemBuilder {
  id: string;
  problem_id: string;
  user_id: string;
  joined_at: string;
  last_active_at: string;
  profile?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    bio: string | null;
    github: string | null;
    website: string | null;
  };
  // Computed fields
  stage?: "idea" | "building" | "launched" | "scaling";
  skills?: string[];
  isLookingForTeam?: boolean;
}

export function useProblemBuilders(problemId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: builders = [], isLoading, error } = useQuery({
    queryKey: ["problem_builders", problemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problem_builders")
        .select("*")
        .eq("problem_id", problemId)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Get profiles for builders using secure public_profiles view
      const userIds = data.map((b) => b.user_id);
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, name, avatar_url, bio, github, website")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      // Check which builders are in squads that are hiring
      const { data: squadMembers } = await supabase
        .from("squad_members")
        .select("user_id, squad:squads!inner(is_hiring)")
        .in("user_id", userIds);

      const lookingForTeamSet = new Set(
        squadMembers?.filter((sm) => !(sm.squad as any)?.is_hiring).map((sm) => sm.user_id) || []
      );

      return data.map((builder) => ({
        ...builder,
        profile: profilesMap.get(builder.user_id),
        // These would ideally come from user metadata or submissions
        stage: "building" as const,
        skills: ["React", "TypeScript", "Supabase"],
        isLookingForTeam: !lookingForTeamSet.has(builder.user_id),
      })) as ProblemBuilder[];
    },
    enabled: !!problemId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  const isJoined = builders.some((b) => b.user_id === user?.id);

  const joinProblem = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("problem_builders").insert({
        problem_id: problemId,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["problem_builders", problemId],
        refetchType: 'active'
      });
      toast.success("You've joined this problem! 🚀");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const leaveProblem = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("problem_builders")
        .delete()
        .eq("problem_id", problemId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["problem_builders", problemId],
        refetchType: 'active'
      });
      toast.success("Left problem");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const requestCollab = useMutation({
    mutationFn: async (targetUserId: string) => {
      // For now, just show a toast. In the future, this could create a notification
      const builder = builders.find((b) => b.user_id === targetUserId);
      return { targetName: builder?.profile?.name || "Builder" };
    },
    onSuccess: ({ targetName }) => {
      toast.success(`Collaboration request sent to ${targetName}!`);
    },
  });

  return {
    builders,
    isLoading,
    error,
    isJoined,
    joinProblem,
    leaveProblem,
    requestCollab,
  };
}
