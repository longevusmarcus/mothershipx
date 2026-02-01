import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { MasonryGrid, ColumnCount } from "@/components/MasonryGrid";
import { Badge } from "@/components/ui/badge";
import { useProblems } from "@/hooks/useProblems";
import { useProblemEvidenceSummary } from "@/hooks/useProblemEvidence";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategories } from "@/hooks/useCategories";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SignalOfTheDayModal } from "@/components/SignalOfTheDayModal";
import { ProblemsActionBar } from "@/components/ProblemsActionBar";

const COLUMNS_KEY = "mothership_columns_count";
const CATEGORY_KEY = "mothership_selected_category";
const FILTERS_KEY = "mothership_problems_filters";

interface FilterState {
  sources: string[];
  formats: string[];
}

const Problems = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const saved = localStorage.getItem(CATEGORY_KEY);
    return saved || "mental health";
  });
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [signalOfDayOpen, setSignalOfDayOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem(FILTERS_KEY);
    return saved ? JSON.parse(saved) : { sources: [], formats: [] };
  });
  const [columnCount, setColumnCount] = useState<ColumnCount>(() => {
    const saved = localStorage.getItem(COLUMNS_KEY);
    return (saved ? parseInt(saved) : 3) as ColumnCount;
  });
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Cycle through column counts
  const cycleColumns = useCallback(() => {
    setColumnCount((prev) => {
      const next = prev === 2 ? 3 : prev === 3 ? 4 : 2;
      localStorage.setItem(COLUMNS_KEY, String(next));
      return next;
    });
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    localStorage.setItem(FILTERS_KEY, JSON.stringify(newFilters));
  }, []);

  const { isAuthenticated } = useAuth();
  const { hasPremiumAccess, isLoading: subscriptionLoading, isAdmin } = useSubscription();
  const { data: problems = [], isLoading } = useProblems(selectedCategory);
  const { data: evidenceSummary } = useProblemEvidenceSummary();
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

  // Filter problems based on search, sources, and formats
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // Text search filter
      const matchesSearch =
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // If no filters active, show all
      const hasSourceFilters = filters.sources.length > 0;
      const hasFormatFilters = filters.formats.length > 0;
      
      if (!hasSourceFilters && !hasFormatFilters) return true;

      // Get evidence summary for this problem
      const evidence = evidenceSummary?.get(problem.dbId || problem.id);
      
      // Source filter: problem must have at least one of the selected sources
      if (hasSourceFilters) {
        if (!evidence) return false;
        const hasMatchingSource = filters.sources.some(source => 
          evidence.sources.includes(source)
        );
        if (!hasMatchingSource) return false;
      }

      // Format filter: map UI formats to evidence_type values
      if (hasFormatFilters) {
        if (!evidence) return false;
        const formatMapping: Record<string, string[]> = {
          pain_points: ["comment"], // Comments represent pain points
          trends: ["video"], // Videos represent trends
        };
        const requiredTypes = filters.formats.flatMap(f => formatMapping[f] || []);
        const hasMatchingFormat = requiredTypes.some(type => 
          evidence.evidence_types.includes(type)
        );
        if (!hasMatchingFormat) return false;
      }

      return true;
    });
  }, [problems, searchQuery, filters, evidenceSummary]);

  return (
    <AppLayout>
      <SEO
        title="Live Signals"
        description="Discover real problems and trends from 10+ data sources. Find market opportunities and build solutions."
      />
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Live Signals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProblems.length} pain points and trends with real momentum to build for in Q1 2026 (continuously
            AI-validated)
          </p>
        </motion.div>

        {/* Floating Action Bar - hidden on mobile */}
        {!isMobile && (
          <ProblemsActionBar
            isRefreshing={isRefreshing}
            onRefresh={handleRefreshData}
            onAutoBuild={() => setSignalOfDayOpen(true)}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            columnCount={columnCount}
            onCycleColumns={cycleColumns}
            isAdmin={isAdmin}
          />
        )}

        {/* Signal of the Day Modal */}
        <SignalOfTheDayModal 
          open={signalOfDayOpen} 
          onOpenChange={setSignalOfDayOpen} 
          problems={filteredProblems.map(p => ({
            id: p.dbId || p.id,
            title: p.title,
            subtitle: p.subtitle || null,
            category: p.category,
            niche: p.niche || p.category,
            sentiment: p.sentiment as any,
            opportunity_score: p.opportunityScore,
            market_size: p.marketSize || null,
            demand_velocity: p.demandVelocity || 0,
            competition_gap: p.competitionGap || 0,
            views: p.views || 0,
            saves: p.saves || 0,
            shares: p.shares || 0,
            trending_rank: p.trendingRank || null,
            is_viral: p.isViral || false,
            slots_total: p.slotsTotal || 10,
            slots_filled: p.slotsFilled || 0,
            active_builders_last_24h: p.activeBuildersLast24h || 0,
            sources: p.sources?.map(s => ({ source: s.source as any, metric: s.metric, value: s.value })) || [],
            pain_points: p.painPoints || [],
            hidden_insight: null,
            discovered_at: p.discoveredAt || new Date().toISOString(),
            peak_prediction: p.peakPrediction || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))} 
        />

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
                onClick={() => {
                  setSelectedCategory(cat);
                  localStorage.setItem(CATEGORY_KEY, cat);
                }}
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
              columnCount={columnCount}
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
