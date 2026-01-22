import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export function useUserPins() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's pinned problem IDs
  const { data: pinnedIds = new Set<string>(), isLoading } = useQuery({
    queryKey: ["user-pins", user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();

      const { data, error } = await supabase
        .from("user_problem_pins")
        .select("problem_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching pins:", error);
        return new Set<string>();
      }

      return new Set(data.map((pin) => pin.problem_id));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add a pin
  const addPin = useMutation({
    mutationFn: async (problemId: string) => {
      if (!user) throw new Error("Must be logged in to pin");

      const { error } = await supabase.from("user_problem_pins").insert({
        user_id: user.id,
        problem_id: problemId,
      });

      if (error) throw error;
      return problemId;
    },
    onMutate: async (problemId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["user-pins", user?.id] });
      const previous = queryClient.getQueryData<Set<string>>(["user-pins", user?.id]);
      
      queryClient.setQueryData<Set<string>>(["user-pins", user?.id], (old) => {
        const newSet = new Set(old);
        newSet.add(problemId);
        return newSet;
      });

      return { previous };
    },
    onError: (err, problemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user-pins", user?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-pins", user?.id] });
    },
  });

  // Remove a pin
  const removePin = useMutation({
    mutationFn: async (problemId: string) => {
      if (!user) throw new Error("Must be logged in to unpin");

      const { error } = await supabase
        .from("user_problem_pins")
        .delete()
        .eq("user_id", user.id)
        .eq("problem_id", problemId);

      if (error) throw error;
      return problemId;
    },
    onMutate: async (problemId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["user-pins", user?.id] });
      const previous = queryClient.getQueryData<Set<string>>(["user-pins", user?.id]);
      
      queryClient.setQueryData<Set<string>>(["user-pins", user?.id], (old) => {
        const newSet = new Set(old);
        newSet.delete(problemId);
        return newSet;
      });

      return { previous };
    },
    onError: (err, problemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user-pins", user?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-pins", user?.id] });
    },
  });

  // Toggle pin
  const togglePin = (problemId: string) => {
    if (pinnedIds.has(problemId)) {
      removePin.mutate(problemId);
    } else {
      addPin.mutate(problemId);
    }
  };

  return {
    pinnedIds,
    isLoading,
    togglePin,
    isPinned: (problemId: string) => pinnedIds.has(problemId),
  };
}
