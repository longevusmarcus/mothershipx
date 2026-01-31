import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface ProblemEvidence {
  id: string;
  problem_id: string;
  evidence_type: "video" | "comment";
  source: "tiktok" | "reddit" | "youtube" | "twitter";
  
  // Video fields
  video_url?: string;
  video_thumbnail?: string;
  video_title?: string;
  video_author?: string;
  video_author_avatar?: string;
  video_views?: number;
  video_likes?: number;
  video_comments_count?: number;
  
  // Comment fields
  comment_text?: string;
  comment_author?: string;
  comment_author_avatar?: string;
  comment_upvotes?: number;
  comment_source_url?: string;
  
  scraped_at: string;
  created_at: string;
}

export function useProblemEvidence(problemId: string | undefined) {
  return useQuery({
    queryKey: ["problem-evidence", problemId],
    queryFn: async () => {
      if (!problemId) return { videos: [], comments: [] };

      const { data, error } = await supabase
        .from("problem_evidence")
        .select("*")
        .eq("problem_id", problemId)
        .order("scraped_at", { ascending: false });

      if (error) {
        console.error("Error fetching problem evidence:", error);
        return { videos: [], comments: [] };
      }

      const evidence = (data || []) as ProblemEvidence[];
      
      return {
        videos: evidence.filter((e) => e.evidence_type === "video"),
        comments: evidence.filter((e) => e.evidence_type === "comment"),
      };
    },
    enabled: !!problemId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useScrapeEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      problemId,
      searchQuery,
      source = "tiktok",
    }: {
      problemId: string;
      searchQuery: string;
      source?: "tiktok" | "reddit" | "youtube";
    }) => {
      const { data, error } = await supabase.functions.invoke("scrape-problem-evidence", {
        body: { problemId, searchQuery, source },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Force immediate refetch by using refetchType 'all' to bypass staleTime
      queryClient.invalidateQueries({ 
        queryKey: ["problem-evidence", variables.problemId],
        refetchType: 'all'
      });
    },
  });
}

interface ProblemEvidenceSummary {
  problem_id: string;
  sources: string[];
  evidence_types: string[];
}

export function useProblemEvidenceSummary() {
  return useQuery({
    queryKey: ["problem-evidence-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problem_evidence")
        .select("problem_id, source, evidence_type");

      if (error) {
        console.error("Error fetching problem evidence summary:", error);
        return new Map<string, ProblemEvidenceSummary>();
      }

      // Group by problem_id
      const summaryMap = new Map<string, ProblemEvidenceSummary>();

      for (const row of data || []) {
        const existing = summaryMap.get(row.problem_id);
        if (existing) {
          if (!existing.sources.includes(row.source)) {
            existing.sources.push(row.source);
          }
          if (!existing.evidence_types.includes(row.evidence_type)) {
            existing.evidence_types.push(row.evidence_type);
          }
        } else {
          summaryMap.set(row.problem_id, {
            problem_id: row.problem_id,
            sources: [row.source],
            evidence_types: [row.evidence_type],
          });
        }
      }

      return summaryMap;
    },
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
    gcTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}
