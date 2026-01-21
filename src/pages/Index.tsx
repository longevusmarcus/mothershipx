import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Zap, LayoutGrid, ArrowUp, ArrowUpRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { SearchResults } from "@/components/SearchResults";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import type { SearchResult } from "@/components/SearchResultCard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"search" | "neural" | "grid">("search");
  const [selectedSources, setSelectedSources] = useState<string[]>(["tiktok", "reddit", "youtube", "freelancer"]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();

      // If user is not logged in, show auth modal first
      if (!user) {
        setPendingQuery(query);
        setShowAuthModal(true);
        return;
      }

      // User is logged in, perform the search
      await performSearch(query);
    }
  };

  const performSearch = async (query: string) => {
    setSubmittedQuery(query);
    setHasSearched(true);
    setIsSearching(true);
    setSearchResults([]);

    try {
      // Save the search interest
      await supabase.from("search_interests").insert({
        query: query,
        user_id: user?.id || null,
        email: profile?.email || user?.email || null,
      });

      // Call the search edge function
      const { data, error } = await supabase.functions.invoke("search-tiktok", {
        body: { query },
      });

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } else if (data?.success && data?.data) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error("Failed to search:", error);
    }

    setIsSearching(false);
    setSearchQuery("");
  };

  const handleAuthSuccess = () => {
    // After successful auth, perform the search
    if (pendingQuery) {
      performSearch(pendingQuery);
      setPendingQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e);
    }
  };

  const handleNewSearch = () => {
    setHasSearched(false);
    setSearchResults([]);
    setSubmittedQuery("");
  };

  return (
    <AppLayout>
      <SEO
        title="Mothership Search"
        description="Discover real problems and trends from 10+ data sources. Build solutions together with our community of builders."
      />

      <div className={cn(
        "flex flex-col min-h-[calc(100vh-8rem)]",
        hasSearched ? "justify-start pt-6" : "items-center justify-center"
      )}>
        {/* Title - Only show when not searched */}
        {!hasSearched && (
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-center mb-8"
          >
            Mothership Search
          </motion.h1>
        )}

        {/* Search Results - Chat-like vertical display */}
        {hasSearched && (
          <div className="w-full max-w-2xl mx-auto px-4 mb-6 flex-1 overflow-y-auto">
            <SearchResults
              results={searchResults}
              isLoading={isSearching}
              searchQuery={submittedQuery}
            />
            
            {/* View Library Link */}
            {searchResults.some(r => r.addedToLibrary) && !isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 pl-11"
              >
                <Button
                  variant="outline"
                  onClick={() => navigate("/problems")}
                  className="gap-2"
                >
                  View in Library
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Search Box - Fixed at bottom when searched, centered when not */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: hasSearched ? 0 : 0.1 }}
          className={cn(
            "w-full max-w-2xl px-4",
            hasSearched && "sticky bottom-4 mt-auto"
          )}
        >
          <form onSubmit={handleSearch}>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Find pain points and 30-day trends in mental health on TikTok"
                className="w-full px-4 py-5 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 placeholder:font-light placeholder:tracking-wide placeholder:lowercase"
              />

              {/* Bottom Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                {/* Mode Toggles */}
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setSearchMode("search")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      searchMode === "search" ? "bg-background shadow-sm" : "hover:bg-background/50",
                    )}
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMode("neural")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      searchMode === "neural" ? "bg-background shadow-sm" : "hover:bg-background/50",
                    )}
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMode("grid")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      searchMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  disabled={!searchQuery.trim() || isSearching}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Data Sources - Only show when not searched */}
        {!hasSearched && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-2xl px-4 mt-8"
            >
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Data Sources</p>
                    <p className="text-xs text-muted-foreground">Scraping TikTok, Reddit, YouTube & Freelancer</p>
                  </div>
                </div>
                <DataSourceSelector onSelectionChange={setSelectedSources} />
              </div>
            </motion.div>

            {/* Featured Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <a
                href="https://drive.google.com/file/d/1cRqz_GYzouxZ5OQQGYnmPwz6IX0y5v_V/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full border border-border/50 hover:border-border"
              >
                What we're working on
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          </>
        )}
      </div>

      {/* Auth Modal for logged out users */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleAuthSuccess} />
    </AppLayout>
  );
};

export default Index;
