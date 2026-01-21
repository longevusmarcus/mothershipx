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
  previousRating?: number;
  ratingChange?: number;
  firstSeenAt?: string;
  isNew?: boolean;
  source?: "serp" | "hackernews" | "producthunt";
}

export interface ThreatLevel {
  level: "Low" | "Moderate" | "High" | "Critical";
  score: number;
  description: string;
}

interface CompetitorResponse {
  success: boolean;
  competitors: Competitor[];
  threatLevel: ThreatLevel;
  query: string;
}

export function useCompetitors(
  problemId: string,
  problemTitle: string,
  opportunityScore: number,
  niche?: string,
  enabled = false
) {
  const [hasSearched, setHasSearched] = useState(false);

  const query = useQuery({
    queryKey: ["competitors", problemId, problemTitle],
    queryFn: async (): Promise<{ competitors: Competitor[]; threatLevel: ThreatLevel }> => {
      const { data, error } = await supabase.functions.invoke<CompetitorResponse>("search-competitors", {
        body: { 
          problemId,
          problemTitle,
          niche,
          opportunityScore,
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
      return {
        competitors: data.competitors,
        threatLevel: data.threatLevel,
      };
    },
    enabled: enabled && !!problemTitle,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  return {
    ...query,
    competitors: query.data?.competitors,
    threatLevel: query.data?.threatLevel,
    hasSearched,
  };
}
