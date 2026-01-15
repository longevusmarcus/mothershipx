import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Zap, LayoutGrid, ArrowUp } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"search" | "neural" | "grid">("search");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/problems?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e);
    }
  };

  return (
    <AppLayout title="Search">
      <SEO 
        title="Mothership Search" 
        description="Discover real problems and trends from 10+ data sources. Build solutions together with our community of builders."
      />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center mb-8"
        >
          Mothership Search
        </motion.h1>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-2xl px-4"
        >
          <form onSubmit={handleSearch}>
            <div className="relative rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search problems, trends, opportunities..."
                className="w-full px-4 py-4 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
              />
              
              {/* Bottom Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-secondary/30">
                {/* Mode Toggles */}
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setSearchMode("search")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      searchMode === "search" ? "bg-background shadow-sm" : "hover:bg-background/50"
                    )}
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMode("neural")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      searchMode === "neural" ? "bg-background shadow-sm" : "hover:bg-background/50"
                    )}
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMode("grid")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      searchMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90"
                  disabled={!searchQuery.trim()}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Featured Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/problems")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            Browse Library
            <span className="text-xs">↗</span>
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Index;