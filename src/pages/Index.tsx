import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Zap, LayoutGrid, ArrowUpRight, ChevronDown, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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
import { useSubscription } from "@/contexts/SubscriptionContext";
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
  const [dataSourcesExpanded, setDataSourcesExpanded] = useState(true);
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
    // After successful auth, check subscription before proceeding
    if (pendingNiche) {
      const nicheToSearch = pendingNiche;
      setPendingNiche(null);
      
      // Re-check subscription - if not premium, show paywall
      if (!hasPremiumAccess && !subscriptionLoading) {
        setPendingNiche(nicheToSearch);
        setShowPaywall(true);
        return;
      }
      
      // User has premium access, perform the search
      performSearch(nicheToSearch);
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
    <>
      <SEO />

      {/* Simulated background - blurred signals page effect */}
      <div className="fixed inset-0 z-40 bg-gradient-to-br from-background via-background to-muted opacity-30" />
      <div className="fixed inset-0 z-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background))_70%)]" />
        {/* Simulated card shapes in background */}
        <div className="absolute top-20 left-[10%] w-64 h-40 rounded-xl bg-card/20 blur-sm" />
        <div className="absolute top-32 left-[35%] w-72 h-48 rounded-xl bg-card/15 blur-sm" />
        <div className="absolute top-24 right-[15%] w-60 h-44 rounded-xl bg-card/20 blur-sm" />
        <div className="absolute top-[45%] left-[8%] w-68 h-52 rounded-xl bg-card/15 blur-sm" />
        <div className="absolute top-[50%] left-[38%] w-64 h-40 rounded-xl bg-card/20 blur-sm" />
        <div className="absolute top-[42%] right-[12%] w-72 h-48 rounded-xl bg-card/15 blur-sm" />
      </div>

      {/* Dark overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl"
      >
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-5" />

        {/* Close button - minimal, no container */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/problems")}
          className="absolute top-5 right-5 p-1 text-white/40 hover:text-white transition-colors z-10"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </motion.button>

        {/* Content container */}
        <div className="relative z-10 h-full overflow-y-auto">
          <div className="container max-w-4xl mx-auto px-4 py-12">
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
              <div className="rounded-xl border border-dashed border-muted-foreground/15 bg-card overflow-hidden">
                {/* Collapsible Header */}
                <button
                  onClick={() => setDataSourcesExpanded(!dataSourcesExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Data Sources</p>
                      <p className="text-xs text-muted-foreground">Currently scraping TikTok</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: dataSourcesExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary/50 transition-colors"
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {dataSourcesExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1">
                        <DataSourceSelector onSelectionChange={setSelectedSource} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          </div>
        </div>
      </motion.div>

      {/* Auth Modal for logged out users */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleAuthSuccess} />
      
      {/* Subscription Paywall */}
      <SubscriptionPaywall 
        open={showPaywall} 
        onOpenChange={setShowPaywall} 
        feature="search"
      />
    </>
  );
};

export default Index;
