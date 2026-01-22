import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Badge } from "@/components/ui/badge";
import { useProblems } from "@/hooks/useProblems";
import { useCategories } from "@/hooks/useCategories";

const Problems = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const { data: problems = [], isLoading } = useProblems(selectedCategory);
  const { data: categories = ["All"] } = useCategories();

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
        title="Library"
        description="Discover real problems and trends from 10+ data sources. Find market opportunities and build solutions."
      />
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProblems.length} problems and trends discovered
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="search problems, niches, opportunities..."
              className="w-full pl-9 pr-4 py-3 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-0 focus:border-border placeholder:text-muted-foreground/60 placeholder:font-light placeholder:tracking-wide placeholder:lowercase"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto touch-scroll pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
        >
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors whitespace-nowrap flex-shrink-0"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </motion.div>

        {/* Problems Masonry Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MasonryGrid problems={filteredProblems} />
        </motion.div>

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