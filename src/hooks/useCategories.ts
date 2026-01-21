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
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
      
      // Normalize helper - convert to lowercase display
      const normalize = (cat: string) => cat.toLowerCase();
      
      // Sort alphabetically but keep common ones at the top
      const priorityCategories = [
        "mental health",
        "weight & fitness",
        "skin & beauty",
        "gut health",
        "productivity",
        "career",
        "social connections"
      ];
      
      const sorted = uniqueCategories.sort((a, b) => {
        const aNorm = normalize(a);
        const bNorm = normalize(b);
        const aIndex = priorityCategories.indexOf(aNorm);
        const bIndex = priorityCategories.indexOf(bNorm);
        
        // Both in priority list - sort by priority order
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        // Only a in priority list - a comes first
        if (aIndex !== -1) return -1;
        // Only b in priority list - b comes first
        if (bIndex !== -1) return 1;
        // Neither in priority list - alphabetical
        return aNorm.localeCompare(bNorm);
      });

      // Return lowercase categories
      return ["all", ...sorted.map(c => c.toLowerCase())];
    },
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
  });
}
