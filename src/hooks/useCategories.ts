import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("category")
        .order("category");

      if (error) {
        console.error("Error fetching categories:", error);
        return ["All"];
      }

      // Get unique categories from database and normalize to lowercase
      const lowercaseCategories = data
        .map(p => p.category?.toLowerCase())
        .filter(Boolean) as string[];
      
      // Deduplicate using Set on lowercase values
      const uniqueCategories = [...new Set(lowercaseCategories)];
      
      // Priority order for display
      const priorityCategories = [
        "mental health",
        "weight & fitness",
        "skin & beauty",
        "gut health",
        "productivity",
        "career",
        "business",
        "connections"
      ];
      
      const sorted = uniqueCategories.sort((a, b) => {
        const aIndex = priorityCategories.indexOf(a);
        const bIndex = priorityCategories.indexOf(b);
        
        // Both in priority list - sort by priority order
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        // Only a in priority list - a comes first
        if (aIndex !== -1) return -1;
        // Only b in priority list - b comes first
        if (bIndex !== -1) return 1;
        // Neither in priority list - alphabetical
        return a.localeCompare(b);
      });

      return ["all", ...sorted];
    },
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
  });
}
