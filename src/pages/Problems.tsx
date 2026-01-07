import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, Zap, Database, Flame, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { MarketProblemCard } from "@/components/MarketProblemCard";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { AITransformPanel } from "@/components/AITransformPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMarketProblems, categories } from "@/data/marketIntelligence";

const Problems = () => {
  const [selectedSources, setSelectedSources] = useState<string[]>(["tiktok", "google_trends"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProblems = mockMarketProblems.filter((problem) => {
    const matchesCategory = selectedCategory === "All" || problem.category === selectedCategory;
    const matchesSearch = 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const viralCount = mockMarketProblems.filter(p => p.isViral).length;
  const explodingCount = mockMarketProblems.filter(p => p.sentiment === "exploding").length;
  const totalOpportunityValue = mockMarketProblems.reduce((acc, p) => {
    const value = parseFloat(p.marketSize.replace(/[^0-9.]/g, ''));
    return acc + value;
  }, 0);

  return (
    <AppLayout title="Problems & Trends">
      <SEO 
        title="Problems & Trends" 
        description="Discover real problems and trends from 10+ data sources. Find market opportunities and build solutions."
      />
      <div className="space-y-4 sm:space-y-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-gradient-glow" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Products to Build in 2026</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Real problems from TikTok, Google Trends & Freelancer
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/30">
                  <Flame className="h-3 w-3" />
                  {viralCount} Viral
                </Badge>
                <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/30">
                  <TrendingUp className="h-3 w-3" />
                  ${totalOpportunityValue.toFixed(1)}B+ TAM
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Source Selection */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base">Data Sources</CardTitle>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    Scraping TikTok, Google Trends, Freelancer & more
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <DataSourceSelector onSelectionChange={setSelectedSources} />
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Transform Panel - Locked for non-founders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <AITransformPanel selectedSources={selectedSources} isAdmin={false} />
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 sm:space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems, niches, opportunities..."
                className="pl-9 bg-secondary border-0 h-10 sm:h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 sm:h-10">
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 sm:h-10">
                <TrendingUp className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sort by Momentum</span>
              </Button>
            </div>
          </div>

          {/* Categories - Horizontal Scroll on Mobile */}
          <div className="flex gap-2 overflow-x-auto touch-scroll pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
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
          </div>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Card variant="elevated" className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">{filteredProblems.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Opportunities</p>
              </div>
            </div>
          </Card>
          <Card variant="elevated" className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-destructive">{explodingCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Exploding</p>
              </div>
            </div>
          </Card>
          <Card variant="elevated" className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-success">24</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">New Today</p>
              </div>
            </div>
          </Card>
          <Card variant="elevated" className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-warning">89%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredProblems.map((problem, index) => (
            <MarketProblemCard
              key={problem.id}
              problem={problem}
              delay={0.05 * index}
            />
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No problems found matching your criteria.</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Problems;
