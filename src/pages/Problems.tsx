import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Badge } from "@/components/ui/badge";
import { useProblems } from "@/hooks/useProblems";
import { useCategories } from "@/hooks/useCategories";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";

const Problems = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const { isAuthenticated } = useAuth();
  const { hasPremiumAccess, isLoading: subscriptionLoading } = useSubscription();
  const { data: problems = [], isLoading } = useProblems(selectedCategory, isAuthenticated);
  const { data: categories = ["All"] } = useCategories();

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
        title="Dashboard"
        description="Discover real problems and trends from 10+ data sources. Find market opportunities and build solutions."
      />
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProblems.length} pre-validated problems and trends to build for in 2026
          </p>
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
