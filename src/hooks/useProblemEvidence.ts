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
