import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SolutionContributor {
  id: string;
  user_id: string;
  profile?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}

export interface Solution {
  id: string;
  problem_id: string;
  title: string;
  description: string;
  approach: string | null;
  tech_stack: string[];
  market_fit: number;
  upvotes: number;
  forks: number;
  comments: number;
  edit_count: number;
  status: "concept" | "validated" | "building" | "launched";
  ai_generated: boolean;
  last_editor_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  contributors?: SolutionContributor[];
  has_upvoted?: boolean;
  creator?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}

export function useSolutions(problemId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: solutions = [], isLoading, error } = useQuery({
    queryKey: ["solutions", problemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("problem_id", problemId)
        .order("upvotes", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Get contributors
      const solutionIds = data.map((s) => s.id);
      const { data: contributors } = await supabase
        .from("solution_contributors")
        .select("*")
        .in("solution_id", solutionIds);

      // Get user upvotes to check if current user upvoted
      let userUpvotes: string[] = [];
      if (user) {
        const { data: upvotes } = await supabase
          .from("solution_upvotes")
          .select("solution_id")
          .eq("user_id", user.id)
          .in("solution_id", solutionIds);
        userUpvotes = upvotes?.map((u) => u.solution_id) || [];
      }

      // Get profiles for contributors and creators using secure public_profiles view
      const allUserIds = [
        ...new Set([
          ...data.map((s) => s.created_by),
          ...(contributors?.map((c) => c.user_id) || []),
        ]),
      ];
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, name, avatar_url")
        .in("id", allUserIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return data.map((solution) => ({
        ...solution,
        has_upvoted: userUpvotes.includes(solution.id),
        creator: profilesMap.get(solution.created_by),
        contributors: contributors
          ?.filter((c) => c.solution_id === solution.id)
          .map((c) => ({
            ...c,
            profile: profilesMap.get(c.user_id),
          })),
      })) as Solution[];
    },
    enabled: !!problemId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  const createSolution = useMutation({
    mutationFn: async ({
      title,
      description,
      approach,
      techStack = [],
      marketFit,
    }: {
      title: string;
      description: string;
      approach?: string;
      techStack?: string[];
      marketFit?: number;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("solutions")
        .insert({
          problem_id: problemId,
          title,
          description,
          approach: approach || null,
          tech_stack: techStack,
          market_fit: marketFit ?? 0,
          created_by: user.id,
          last_editor_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as contributor
      await supabase.from("solution_contributors").insert({
        solution_id: data.id,
        user_id: user.id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solutions", problemId] });
      toast.success("Idea created! 🚀");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateSolution = useMutation({
    mutationFn: async ({
      id,
      approach,
    }: {
      id: string;
      approach: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Get current solution to increment edit count
      const current = solutions.find((s) => s.id === id);
      const newEditCount = (current?.edit_count || 0) + 1;

      const { error } = await supabase
        .from("solutions")
        .update({
          approach,
          last_editor_id: user.id,
          edit_count: newEditCount,
        })
        .eq("id", id);

      if (error) throw error;

      // Add as contributor if not already
      await supabase
        .from("solution_contributors")
        .upsert({ solution_id: id, user_id: user.id }, { onConflict: "solution_id,user_id" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solutions", problemId] });
      toast.success("Edit saved! ✨");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleUpvote = useMutation({
    mutationFn: async ({ solutionId, hasUpvoted }: { solutionId: string; hasUpvoted: boolean }) => {
      if (!user) throw new Error("Must be logged in");

      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from("solution_upvotes")
          .delete()
          .eq("solution_id", solutionId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Add upvote
        const { error } = await supabase
          .from("solution_upvotes")
          .insert({ solution_id: solutionId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solutions", problemId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const forkSolution = useMutation({
    mutationFn: async (solutionId: string) => {
      if (!user) throw new Error("Must be logged in");

      const original = solutions.find((s) => s.id === solutionId);
      if (!original) throw new Error("Solution not found");

      // Create forked solution
      const { data, error } = await supabase
        .from("solutions")
        .insert({
          problem_id: problemId,
          title: `${original.title} (Fork)`,
          description: original.description,
          approach: original.approach,
          tech_stack: original.tech_stack,
          created_by: user.id,
          last_editor_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Increment fork count on original
      await supabase
        .from("solutions")
        .update({ forks: original.forks + 1 })
        .eq("id", solutionId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solutions", problemId] });
      toast.success("Forked! 🌿");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    solutions,
    isLoading,
    error,
    createSolution,
    updateSolution,
    toggleUpvote,
    forkSolution,
  };
}
