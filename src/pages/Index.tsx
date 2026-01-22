import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Zap, LayoutGrid, ArrowUpRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { NicheSelector, NICHES, type NicheId } from "@/components/NicheSelector";
import { ChannelSelector } from "@/components/ChannelSelector";
import { SubredditSelector } from "@/components/SubredditSelector";
import { SearchResults } from "@/components/SearchResults";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import type { SearchResult } from "@/components/SearchResultCard";

type SearchMode = "search" | "quick" | "grid";

const Index = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>("search");
  const [selectedSource, setSelectedSource] = useState<string>("tiktok");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingNiche, setPendingNiche] = useState<NicheId | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<NicheId | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPremiumAccess, isLoading: subscriptionLoading } = useSubscription();

  // Quick scan - search all niches at once
  const handleQuickScan = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Check premium access
    if (!hasPremiumAccess && !subscriptionLoading) {
      setShowPaywall(true);
      return;
    }

    setSearchMode("quick");
    setHasSearched(true);
    setIsSearching(true);
    setSearchResults([]);
    setSelectedNiche(null);

    try {
      // Pick 3 random niches and scan them
      const randomNiches = [...NICHES].sort(() => Math.random() - 0.5).slice(0, 3);
      const allResults: SearchResult[] = [];

      for (const niche of randomNiches) {
        const { data, error } = await supabase.functions.invoke("search-tiktok", {
          body: { niche: niche.id },
        });

        if (!error && data?.success && data?.data) {
          allResults.push(...data.data);
        }
      }

      // Sort by opportunity score and take top results
      const sorted = allResults
        .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
        .slice(0, 10);

      setSearchResults(sorted);
      
      // Invalidate problems cache so Library shows new data
      await queryClient.invalidateQueries({ queryKey: ["problems"] });
      
      toast({
        title: "Quick Scan Complete",
        description: `Found ${sorted.length} top opportunities across ${randomNiches.length} niches`,
      });
    } catch (error) {
      console.error("Quick scan failed:", error);
    }

    setIsSearching(false);
  };

  const handleNicheSelect = async (nicheId: NicheId) => {
    // If user is not logged in, show auth modal first
    if (!user) {
      setPendingNiche(nicheId);
      setShowAuthModal(true);
      return;
    }

    // Check premium access
    if (!hasPremiumAccess && !subscriptionLoading) {
      setPendingNiche(nicheId);
      setShowPaywall(true);
      return;
    }

    // User is logged in and has access, perform the search
    await performSearch(nicheId);
  };

  const performSearch = async (nicheId: NicheId) => {
    const niche = NICHES.find(n => n.id === nicheId);
    if (!niche) return;

    setSelectedNiche(nicheId);
    setHasSearched(true);
    setIsSearching(true);
    setSearchResults([]);

    try {
      // Save the search interest
      await supabase.from("search_interests").insert({
        query: niche.label,
        user_id: user?.id || null,
        email: profile?.email || user?.email || null,
      });

      // Call the search edge function with niche
      const { data, error } = await supabase.functions.invoke("search-tiktok", {
        body: { niche: nicheId },
      });

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } else if (data?.success && data?.data) {
        setSearchResults(data.data);
        
        // Invalidate problems cache so Library shows new data
        await queryClient.invalidateQueries({ queryKey: ["problems"] });
      }
    } catch (error) {
      console.error("Failed to search:", error);
    }

    setIsSearching(false);
  };

  const handleAuthSuccess = () => {
    // After successful auth, perform the search
    if (pendingNiche) {
      performSearch(pendingNiche);
      setPendingNiche(null);
    }
  };

  const handleNewSearch = () => {
    setHasSearched(false);
    setSearchResults([]);
    setSelectedNiche(null);
    setSelectedChannel(null);
  };

  const handleChannelSelect = async (channelId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!hasPremiumAccess && !subscriptionLoading) {
      setShowPaywall(true);
      return;
    }

    await performYouTubeSearch(channelId);
  };

  const performYouTubeSearch = async (channelId: string) => {
    setSelectedChannel(channelId);
    setHasSearched(true);
    setIsSearching(true);
    setSearchResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("search-youtube", {
        body: { channelId },
      });

      if (error) {
        console.error("YouTube search error:", error);
        toast({
          title: "Search Error",
          description: "Failed to search YouTube channel",
          variant: "destructive",
        });
        setSearchResults([]);
      } else if (data?.success && data?.data) {
        // Transform YouTube results to match SearchResult interface
        const transformedResults: SearchResult[] = data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          subtitle: item.description || "",
          category: item.category || "business",
          sentiment: item.sentiment || "rising",
          views: item.viewCount || 0,
          saves: 0,
          shares: 0,
          painPoints: item.painPoints || [],
          sources: item.sources?.map((s: any) => ({
            source: "YouTube",
            metric: s.trend || "",
            value: s.trend || ""
          })) || [],
          isViral: item.isViral || false,
          opportunityScore: item.opportunityScore || 50,
          addedToLibrary: true // All YouTube results are saved to library
        }));
        
        setSearchResults(transformedResults);
        await queryClient.invalidateQueries({ queryKey: ["problems"] });
        toast({
          title: "YouTube Analysis Complete",
          description: `Found ${transformedResults.length} opportunities from ${data.channel}`,
        });
      }
    } catch (error) {
      console.error("Failed to search YouTube:", error);
    }

    setIsSearching(false);
  };

  // Reddit search handler
  const handleSubredditSelect = async (subredditId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!hasPremiumAccess && !subscriptionLoading) {
      setShowPaywall(true);
      return;
    }

    setSelectedSubreddit(subredditId);
    setHasSearched(true);
    setIsSearching(true);
    setSearchResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("search-reddit", {
        body: { subredditId },
      });

      if (error) {
        console.error("Reddit search error:", error);
        toast({
          title: "Search Error",
          description: "Failed to search Reddit",
          variant: "destructive",
        });
        setSearchResults([]);
      } else if (data?.success && data?.data) {
        const transformedResults: SearchResult[] = data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          subtitle: item.description || "",
          category: item.category || "Career",
          sentiment: item.sentiment || "rising",
          views: item.totalScore || 0,
          saves: 0,
          shares: item.totalComments || 0,
          painPoints: item.painPoints || [],
          sources: item.sources?.map((s: any) => ({
            source: "Reddit",
            metric: s.trend || "",
            value: s.trend || ""
          })) || [],
          isViral: item.isViral || false,
          opportunityScore: item.opportunityScore || 50,
          addedToLibrary: true
        }));
        
        setSearchResults(transformedResults);
        await queryClient.invalidateQueries({ queryKey: ["problems"] });
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast({
          title: "Reddit Analysis Complete",
          description: `Found ${transformedResults.length} opportunities from ${data.subreddit}`,
        });
      }
    } catch (error) {
      console.error("Failed to search Reddit:", error);
    }

    setIsSearching(false);
  };

  return (
    <AppLayout>
      <SEO
        title="Mothership Search"
        description="Discover real problems and trends from 10+ data sources. Build solutions together with our community of builders."
      />

      <div className={cn(
        "flex flex-col",
        hasSearched ? "min-h-0 pt-6" : "min-h-[calc(100vh-8rem)] items-center justify-center"
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

        {/* Search Results - Chat-like vertical display or Grid */}
        {hasSearched && (
          <div className="w-full max-w-2xl mx-auto px-4 mb-6">
            <SearchResults
              results={searchResults}
              isLoading={isSearching}
              selectedNiche={selectedNiche}
              viewMode={searchMode === "grid" ? "grid" : "list"}
              isQuickScan={searchMode === "quick"}
            />
          </div>
        )}

        {/* Niche Selector and Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: hasSearched ? 0 : 0.1 }}
          className={cn(
            "w-full max-w-2xl px-4",
            hasSearched && "md:sticky md:bottom-4 mt-6"
          )}
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg p-5 space-y-5">
            {/* Show source-specific selector */}
            {selectedSource === "youtube" ? (
              <ChannelSelector
                selectedChannel={selectedChannel}
                onSelect={handleChannelSelect}
                disabled={isSearching}
              />
            ) : selectedSource === "reddit" ? (
              <SubredditSelector
                selectedSubreddit={selectedSubreddit}
                onSelect={handleSubredditSelect}
                disabled={isSearching}
              />
            ) : (
              <NicheSelector
                selectedNiche={selectedNiche}
                onSelect={handleNicheSelect}
                disabled={isSearching}
              />
            )}

            {/* Bottom Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              {/* Mode Toggles */}
              <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setSearchMode("search")}
                  title="Standard search - pick a niche"
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    searchMode === "search" ? "bg-background shadow-sm" : "hover:bg-background/50",
                  )}
                >
                  <Search className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleQuickScan}
                  title="Quick scan - analyze multiple niches"
                  disabled={isSearching}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    searchMode === "quick" ? "bg-background shadow-sm" : "hover:bg-background/50",
                    isSearching && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Zap className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("grid")}
                  title="Grid view - compact layout"
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    searchMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50",
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              {/* New Search Button when searched */}
              {hasSearched && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewSearch}
                  className="gap-2"
                >
                  New Search
                </Button>
              )}
            </div>
          </div>
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
              <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Data Sources</p>
                    <p className="text-xs text-muted-foreground">Currently scraping TikTok</p>
                  </div>
                </div>
                <DataSourceSelector onSelectionChange={setSelectedSource} />
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
      
      {/* Subscription Paywall */}
      <SubscriptionPaywall 
        open={showPaywall} 
        onOpenChange={setShowPaywall} 
        feature="search"
      />
    </AppLayout>
  );
};

export default Index;
