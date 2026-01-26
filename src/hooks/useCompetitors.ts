import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { getDbProblemId } from "@/data/marketIntelligence";

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

interface DbCompetitor {
  id: string;
  problem_id: string;
  name: string;
  url: string;
  description: string | null;
  rating: number;
  rating_label: string;
  position: number | null;
  previous_rating: number | null;
  rating_change: number | null;
  first_seen_at: string;
  last_seen_at: string;
}

function calculateThreatLevel(competitors: Competitor[], opportunityScore: number): ThreatLevel {
  const avgRating = competitors.length > 0 
    ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length 
    : 0;
  
  const score = Math.round(avgRating * (1 - opportunityScore / 100));
  
  if (score >= 70) return { level: "Critical", score, description: "Market dominated by strong players" };
  if (score >= 50) return { level: "High", score, description: "Significant competition exists" };
  if (score >= 30) return { level: "Moderate", score, description: "Some established players" };
  return { level: "Low", score, description: "Market has room for new entrants" };
}

export function useCompetitors(
  problemId: string,
  problemTitle: string,
  opportunityScore: number,
  niche?: string,
  enabled = false
) {
  const [hasSearched, setHasSearched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Convert mock ID to database UUID if needed
  const dbProblemId = getDbProblemId(problemId);

  // First, check if competitors already exist in the database
  const existingQuery = useQuery({
    queryKey: ["competitors-existing", dbProblemId],
    queryFn: async (): Promise<{ competitors: Competitor[]; threatLevel: ThreatLevel } | null> => {
      const { data, error } = await supabase
        .from("problem_competitors")
        .select("*")
        .eq("problem_id", dbProblemId)
        .order("position", { ascending: true });

      if (error) {
        console.error("Error fetching existing competitors:", error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Transform DB data to Competitor format
      const competitors: Competitor[] = (data as DbCompetitor[]).map((c) => ({
        name: c.name,
        url: c.url,
        description: c.description || "",
        rating: c.rating,
        ratingLabel: c.rating_label,
        position: c.position || 0,
        previousRating: c.previous_rating || undefined,
        ratingChange: c.rating_change || undefined,
        firstSeenAt: c.first_seen_at,
        isNew: new Date(c.first_seen_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }));

      const threatLevel = calculateThreatLevel(competitors, opportunityScore);
      setHasSearched(true);
      
      return { competitors, threatLevel };
    },
    enabled: !!dbProblemId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  // Only fetch from API if no existing data AND tab is enabled AND not already searched
  const shouldFetchFromApi = enabled && !existingQuery.data && !existingQuery.isLoading && !!problemTitle;

  const apiQuery = useQuery({
    queryKey: ["competitors-api", dbProblemId, problemTitle],
    queryFn: async (): Promise<{ competitors: Competitor[]; threatLevel: ThreatLevel }> => {
      const { data, error } = await supabase.functions.invoke<CompetitorResponse>("search-competitors", {
        body: { 
          problemId: dbProblemId,
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
      
      // Invalidate the existing query to refetch from DB
      queryClient.invalidateQueries({ queryKey: ["competitors-existing", dbProblemId] });
      
      return {
        competitors: data.competitors,
        threatLevel: data.threatLevel,
      };
    },
    enabled: shouldFetchFromApi,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });

  // Manual refresh function - forces a new API search
  const refreshCompetitors = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke<CompetitorResponse>("search-competitors", {
        body: { 
          problemId: dbProblemId,
          problemTitle,
          niche,
          opportunityScore,
        },
      });

      if (error) throw error;
      
      // Invalidate both queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ["competitors-existing", dbProblemId] });
      await queryClient.invalidateQueries({ queryKey: ["competitors-api", dbProblemId] });
      
      return data;
    } finally {
      setIsRefreshing(false);
    }
  }, [dbProblemId, problemTitle, niche, opportunityScore, queryClient]);

  // Determine which data to use - prefer existing, fall back to API
  const data = existingQuery.data || apiQuery.data;
  const isLoading = existingQuery.isLoading || (shouldFetchFromApi && apiQuery.isLoading);
  const error = existingQuery.error || apiQuery.error;

  return {
    competitors: data?.competitors,
    threatLevel: data?.threatLevel,
    hasSearched: hasSearched || !!data,
    isLoading,
    isRefreshing,
    error,
    refetch: refreshCompetitors,
  };
}
