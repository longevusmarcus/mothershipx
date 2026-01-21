import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useRefreshProblem(problemId: string) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refresh = async () => {
    if (!problemId || isRefreshing) return;

    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("refresh-problem-data", {
        body: { problemId },
      });

      if (error) throw error;

      // Invalidate the problem query to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ["problem", problemId] });
      
      toast({
        title: "Data refreshed",
        description: "Live signals updated with latest data",
      });

      return data;
    } catch (error) {
      console.error("Refresh error:", error);
      toast({
        title: "Refresh failed",
        description: "Could not update live data. Try again later.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refresh, isRefreshing };
}
