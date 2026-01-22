import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { getDbProblemId } from "@/data/marketIntelligence";

export function useDeleteProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (problemId: string) => {
      // Convert mock ID to database UUID if needed
      const dbId = getDbProblemId(problemId);
      
      const { error } = await supabase
        .from("problems")
        .delete()
        .eq("id", dbId);

      if (error) {
        throw error;
      }

      return problemId;
    },
    onSuccess: () => {
      // Invalidate problems list to refresh
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Problem removed from dashboard");
    },
    onError: (error) => {
      console.error("Failed to delete problem:", error);
      toast.error("Failed to remove problem. Are you an admin?");
    },
  });
}
