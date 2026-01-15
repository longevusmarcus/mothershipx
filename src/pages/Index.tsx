import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Zap, LayoutGrid, ArrowUp, ArrowUpRight, X, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const WELCOME_SHOWN_KEY = "mothershipx_welcome_shown";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"search" | "neural" | "grid">("search");
  const [selectedSources, setSelectedSources] = useState<string[]>(["tiktok", "google_trends", "freelancer"]);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Check if first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
      setIsSaving(true);
      
      // Save the search interest to the database
      try {
        await supabase.from("search_interests").insert({
          query: searchQuery.trim(),
          user_id: user?.id || null,
          email: profile?.email || user?.email || null,
        });
      } catch (error) {
        console.error("Failed to save search interest:", error);
      }
      
      setIsSaving(false);
      setShowWaitlistModal(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e);
    }
  };

  const handleCloseModal = () => {
    setShowWaitlistModal(false);
    setSearchQuery("");
  };

  return (
    <AppLayout>
      <SEO 
        title="Mothership Search" 
        description="Discover real problems and trends from 10+ data sources. Build solutions together with our community of builders."
      />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        {/* Welcome Message */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mb-8 max-w-lg text-center px-4"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Welcome to MothershipX, a social market intelligence platform and hackathon arena empowering builders to ship useful products and win prizes every day.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-center mb-8"
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
            <div className="rounded-xl border border-border bg-card overflow-hidden">
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
              <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                {/* Mode Toggles */}
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
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
                  className="h-9 w-9 rounded-lg"
                  disabled={!searchQuery.trim() || isSaving}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Data Sources */}
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
                <p className="text-xs text-muted-foreground">
                  Scraping TikTok, Google Trends, Freelancer & more
                </p>
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
      </div>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {showWaitlistModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-card border border-border rounded-2xl p-8 shadow-lg relative">
                {/* Close button */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Content */}
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-5">
                    <Sparkles className="h-5 w-5 text-foreground/70" />
                  </div>
                  
                  <h2 className="font-display text-xl mb-3">You're on the list</h2>
                  
                  <p className="text-sm text-muted-foreground mb-1">
                    You're interested in
                  </p>
                  <p className="text-sm font-medium mb-4 px-3 py-1.5 bg-secondary/50 rounded-lg inline-block">
                    "{submittedQuery}"
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-6">
                    Search is coming soon. We'll notify you when it's ready.
                  </p>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        handleCloseModal();
                        navigate("/problems");
                      }}
                      className="w-full"
                    >
                      Browse Library
                    </Button>
                    <button
                      onClick={handleCloseModal}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Index;
