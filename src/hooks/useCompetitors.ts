import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface Competitor {
  name: string;
  url: string;
  description: string;
  rating: number;
  ratingLabel: string;
  position: number;
}

interface CompetitorResponse {
  success: boolean;
  competitors: Competitor[];
  query: string;
}

export function useCompetitors(problemTitle: string, niche?: string, enabled = false) {
  const [hasSearched, setHasSearched] = useState(false);

  const query = useQuery({
    queryKey: ["competitors", problemTitle],
    queryFn: async (): Promise<Competitor[]> => {
      const { data, error } = await supabase.functions.invoke<CompetitorResponse>("search-competitors", {
        body: { 
          problemTitle,
          niche,
        },
      });

      if (error) {
        console.error("Error fetching competitors:", error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error("Failed to fetch competitors");
      }

      setHasSearched(true);
      return data.competitors;
    },
    enabled: enabled && !!problemTitle,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  return {
    ...query,
    hasSearched,
  };
}
