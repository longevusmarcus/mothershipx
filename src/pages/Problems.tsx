import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useProblems } from "@/hooks/useProblems";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategories } from "@/hooks/useCategories";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Problems = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const { isAuthenticated } = useAuth();
  const { hasPremiumAccess, isLoading: subscriptionLoading } = useSubscription();
  const { data: problems = [], isLoading } = useProblems(selectedCategory, isAuthenticated);
  const { data: categories = ["All"] } = useCategories();
  const queryClient = useQueryClient();

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Clear the search cache to force fresh data on next scan
      const { error } = await supabase.from("search_cache").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

      if (error) throw error;

      // Invalidate problems query to refetch
      await queryClient.invalidateQueries({ queryKey: ["problems"] });

      toast.success("Cache cleared", { description: "Next scan will fetch fresh data" });
    } catch (error) {
      console.error("Failed to refresh:", error);
      toast.error("Failed to clear cache");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate blur at page level so it doesn't reset on category change
  const shouldBlurExcess = !isAuthenticated || (!hasPremiumAccess && !subscriptionLoading);

  // Update search query when URL params change
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppLayout>
      <SEO
        title="Live Signals"
        description="Discover real problems and trends from 10+ data sources. Find market opportunities and build solutions."
      />
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative">
          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Live Signals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProblems.length} validated pain points and trends with real momentum to build for in Q1 2026
          </p>

          {/* Refresh Button - hidden on mobile */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto touch-scroll pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center scrollbar-hide"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Badge
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat ? "shadow-sm" : "hover:bg-primary/5 hover:border-primary/30"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* Problems Masonry Grid with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <MasonryGrid
              problems={filteredProblems}
              shouldBlurExcess={shouldBlurExcess}
              isAllCategory={selectedCategory === "all"}
            />
          </motion.div>
        </AnimatePresence>

        {filteredProblems.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-muted-foreground">No problems found matching your criteria.</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Problems;
