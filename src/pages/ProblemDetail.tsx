import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Share2,
  Bookmark,
  Eye,
  Check,
  RefreshCw,
  ExternalLink,
  Search,
  Loader2,
  Lock,
  ArrowUp,
  MessageSquare,
  Plus,
  Terminal,
  Rocket,
  Layers,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { SolutionsLab } from "@/components/SolutionsLab";
import { OpportunityMeter } from "@/components/OpportunityMeter";
import { SourceSignals } from "@/components/SourceSignals";
import { HiddenInsightCard } from "@/components/HiddenInsightCard";
import { TeamFormation } from "@/components/TeamFormation";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { SubscriptionLoadingGate } from "@/components/SubscriptionLoadingGate";
import { PromptsGenerator } from "@/components/PromptsGenerator";
import { AutoBuildModal } from "@/components/AutoBuildModal";
import { ProblemDashboardOnboarding } from "@/components/ProblemDashboardOnboarding";
import { ProblemEvidenceSection } from "@/components/ProblemEvidenceSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getDbProblemId } from "@/data/marketIntelligence";
import { useProblem } from "@/hooks/useProblems";
import { useProblemBuilders } from "@/hooks/useProblemBuilders";
import { useRefreshProblem } from "@/hooks/useRefreshProblem";
import { useCompetitors } from "@/hooks/useCompetitors";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import superloveLogo from "@/assets/superlove-logo.png";

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

const getSentimentLabel = (sentiment: string): { label: string; className: string } => {
  switch (sentiment) {
    case "exploding":
      return { label: "Exploding", className: "text-destructive bg-destructive/10" };
    case "rising":
      return { label: "Rising", className: "text-success bg-success/10" };
    case "stable":
      return { label: "Stable", className: "text-muted-foreground bg-secondary" };
    default:
      return { label: "Declining", className: "text-muted-foreground bg-secondary" };
  }
};

// Detect source type from problem sources
const detectSourceType = (sources: any[] | undefined): "reddit" | "youtube" | "tiktok" | "default" => {
  if (!sources || sources.length === 0) return "default";
  const firstSource = sources[0];
  // Check both 'source' and 'name' keys for compatibility
  const sourceName = (firstSource?.source || firstSource?.name || "").toLowerCase();
  if (sourceName === "reddit") return "reddit";
  if (sourceName === "youtube") return "youtube";
  if (sourceName === "tiktok") return "tiktok";
  return "default";
};

const mockTopSolution = {
  sentimentFitScore: 78,
  problemCoverage: 72,
  adoptionVelocity: 45,
  revenuePresent: true,
  revenueAmount: "$1,240",
  buildMomentum: 85,
  misalignments: [
    "Solution focuses on B2C but problem is more acute in B2B context",
    "No explicit handling of enterprise SSO requirements mentioned in pain points",
  ],
};

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasPremiumAccess, isLoading: subscriptionLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [searchCompetitors, setSearchCompetitors] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [autoBuildOpen, setAutoBuildOpen] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  const wasJoined = useRef(false);
  const startBuildingRef = useRef<HTMLButtonElement>(null);

  // Check access on mount - only show paywall after subscription check completes
  // Use a ref to track if we've already shown the paywall to prevent re-triggering
  const paywallCheckedRef = useRef(false);
  
  useEffect(() => {
    // Only check once when subscription loading finishes
    if (!subscriptionLoading && user && !paywallCheckedRef.current) {
      paywallCheckedRef.current = true;
      if (!hasPremiumAccess) {
        setShowPaywall(true);
      }
    }
    // Dismiss paywall if access is granted (e.g. after a retry succeeds)
    if (hasPremiumAccess && showPaywall) {
      setShowPaywall(false);
    }
    // Reset ref if user logs out
    if (!user) {
      paywallCheckedRef.current = false;
    }
  }, [subscriptionLoading, user, hasPremiumAccess, showPaywall]);

  const { data: problem, isLoading } = useProblem(id || "");
  const dbProblemId = problem?.dbId || id || "";
  const { isJoined, joinProblem, leaveProblem } = useProblemBuilders(dbProblemId);
  const { refresh, isRefreshing } = useRefreshProblem(dbProblemId);

  // Track when user just joined (transition from not joined to joined)
  useEffect(() => {
    if (isJoined && !wasJoined.current) {
      setJustJoined(true);
    }
    wasJoined.current = isJoined;
  }, [isJoined]);
  const { 
    competitors, 
    threatLevel,
    isLoading: competitorsLoading, 
    refetch: refetchCompetitors 
  } = useCompetitors(
    dbProblemId,
    problem?.title || "", 
    problem?.opportunityScore || 50,
    problem?.niche, 
    searchCompetitors
  );

  // Trigger search when tab becomes active
  useEffect(() => {
    if (activeTab === "competitors" && problem?.title && !searchCompetitors) {
      setSearchCompetitors(true);
    }
  }, [activeTab, problem?.title, searchCompetitors]);
  
  // Show loading state while checking subscription (prevents paywall flash)
  if (subscriptionLoading && user) {
    return (
      <AppLayout>
        <SubscriptionLoadingGate message="Checking your access..." />
      </AppLayout>
    );
  }
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  if (!problem) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="font-medium mb-2">Problem not found</h2>
          <p className="text-sm text-muted-foreground mb-4">This opportunity does not exist.</p>
          <Link to="/problems">
            <Button size="sm">Browse Dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }
  
  const slotsRemaining = problem.slotsTotal - problem.slotsFilled;
  const fillPercentage = (problem.slotsFilled / problem.slotsTotal) * 100;
  const sentiment = getSentimentLabel(problem.sentiment);
  const sourceType = detectSourceType(problem.sources);

  const handleJoinToggle = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to start building.",
        variant: "destructive",
      });
      return;
    }
    
    if (isJoined) {
      leaveProblem.mutate();
    } else {
      joinProblem.mutate();
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved!",
      description: isSaved ? "Opportunity removed from your list" : "You will get updates on this opportunity",
    });
  };

  const handleShare = async () => {
    // Use SEO-friendly slug URL for sharing
    const baseUrl = window.location.origin;
    const shareUrl = problem?.slug 
      ? `${baseUrl}/problems/${problem.slug}`
      : window.location.href;
    
    const shareData = { 
      title: problem?.title || "Problem Opportunity", 
      text: problem?.subtitle || "Check out this market opportunity!",
      url: shareUrl 
    };
    
    // Try Web Share API first (mobile/supported browsers)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or share failed - fall through to clipboard
        if ((err as Error).name === 'AbortError') return;
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this opportunity with your network",
      });
    } catch {
      // Final fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast({
        title: "Link copied!",
        description: "Share this opportunity with your network",
      });
    }
  };

  // Generate SEO-friendly canonical URL
  const canonicalUrl = problem?.slug 
    ? `https://mothershipx.lovable.app/problems/${problem.slug}`
    : `https://mothershipx.lovable.app/problems/${id}`;

  return (
    <AppLayout hideChrome>
      <SEO
        title={problem.title}
        description={problem.subtitle || `Discover this ${problem.category} opportunity with ${formatNumber(problem.views)} views.`}
        url={canonicalUrl}
        type="article"
      />
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Link 
          to="/problems" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-5"
        >
          {/* Top Row */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">{problem.category}</span>
            <Badge variant="secondary" className={`text-xs ${sentiment.className}`}>
              {sentiment.label}
            </Badge>
            {problem.trendingRank && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                #{problem.trendingRank} Trending
              </span>
            )}
          </div>
          
          {/* Title & Subtitle */}
          <h1 className="font-display text-xl sm:text-2xl font-normal tracking-tight mb-2">
            {problem.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {problem.subtitle}
          </p>
          
          {/* Stats Row - source-specific, compact on mobile */}
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-4">
            {problem.trendingRank && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5" />
                #{problem.trendingRank}
              </span>
            )}
            {sourceType === "reddit" ? (
              <>
                {problem.views > 0 && (
                  <span className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatNumber(problem.views)}</span>
                    <span className="hidden md:inline">upvotes</span>
                  </span>
                )}
                {problem.shares > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatNumber(problem.shares)}</span>
                    <span className="hidden md:inline">comments</span>
                  </span>
                )}
              </>
            ) : sourceType === "youtube" ? (
              <>
                {problem.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatNumber(problem.views)}</span>
                    <span className="hidden md:inline">views</span>
                  </span>
                )}
                {problem.saves > 0 && (
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatNumber(problem.saves)}</span>
                    <span className="hidden md:inline">likes</span>
                  </span>
                )}
                {problem.shares > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatNumber(problem.shares)}</span>
                    <span className="hidden md:inline">comments</span>
                  </span>
                )}
              </>
            ) : (
              <>
                {problem.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatNumber(problem.views)}</span>
                    <span className="hidden md:inline">Views</span>
                  </span>
                )}
                {problem.saves > 0 && (
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatNumber(problem.saves)}</span>
                    <span className="hidden md:inline">Saves</span>
                  </span>
                )}
                {problem.shares > 0 && (
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{formatNumber(problem.shares)}</span>
                    <span className="hidden md:inline">Shares</span>
                  </span>
                )}
              </>
            )}
          </div>
          
          {/* Action Buttons - Row 1: Joined + Submit (desktop) + Launch buttons + Share */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Button
              ref={startBuildingRef}
              size="sm"
              variant={isJoined ? "outline" : "default"}
              onClick={handleJoinToggle}
              disabled={joinProblem.isPending || leaveProblem.isPending}
              className={isJoined ? "text-success border-success/30" : ""}
            >
              {isJoined ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Joined
                </>
              ) : (
                "Compete to Build"
              )}
            </Button>
            
            {/* Submit Build - inline on desktop only */}
            {isJoined && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="hidden md:block"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: 2, ease: "easeInOut" }}
                >
                  <Button 
                    size="sm"
                    variant="glow"
                    onClick={() => navigate("/submit", {
                      state: {
                        problem: {
                          id: problem.id,
                          title: problem.title,
                          subtitle: problem.subtitle,
                          niche: problem.niche,
                          opportunityScore: problem.opportunityScore,
                          sentiment: problem.sentiment,
                        },
                        joinType: "solo",
                      },
                    })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Submit Build
                  </Button>
                </motion.div>
              </motion.div>
            )}
            
            {/* Launch in Lovable Button - icon only on mobile */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const prompt = encodeURIComponent(`Build a solution for: ${problem.title}\n\n${problem.subtitle || ""}\n\nNiche: ${problem.niche}\nCategory: ${problem.category}`);
                window.open(`https://lovable.dev/projects/create?prompt=${prompt}`, "_blank");
              }}
              className="md:w-auto md:px-3"
            >
              <Rocket className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Launch in Lovable</span>
            </Button>
            
            {/* Launch 10 Ideas Button - icon only on mobile */}
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                toast({
                  title: "Launching ideas...",
                  description: "Opening 10 project tabs sequentially",
                });
                for (let i = 0; i < 10; i++) {
                  const prompt = encodeURIComponent(`Build unique startup idea #${i + 1} for: ${problem.title}\n\nNiche: ${problem.niche}`);
                  window.open(`https://lovable.dev/projects/create?prompt=${prompt}`, "_blank");
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                }
              }}
              className="md:w-auto md:px-3"
            >
              <Layers className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Launch 10 Ideas</span>
            </Button>
            
            {/* Share Button - next to Launch 10 */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Action Buttons - Row 2: Submit Build (full width on mobile only) */}
          {isJoined && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="mb-4 md:hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: 2, ease: "easeInOut" }}
              >
                <Button 
                  size="sm"
                  variant="glow"
                  onClick={() => navigate("/submit", {
                    state: {
                      problem: {
                        id: problem.id,
                        title: problem.title,
                        subtitle: problem.subtitle,
                        niche: problem.niche,
                        opportunityScore: problem.opportunityScore,
                        sentiment: problem.sentiment,
                      },
                      joinType: "solo",
                    },
                  })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Submit Build
                </Button>
              </motion.div>
            </motion.div>
          )}
          
          {/* Builder Capacity */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                Builder Capacity
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium">{problem.slotsFilled}/{problem.slotsTotal}</span>
                <span className="flex items-center gap-1 text-success text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {problem.activeBuildersLast24h} active now
                </span>
              </div>
            </div>
            <Progress value={fillPercentage} className="h-1" />
          </div>
        </motion.div>

        {/* Tabs - compact on mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <TabsList className="h-8 md:h-9 p-0.5 md:p-1 bg-secondary/50 w-max md:w-auto">
              <TabsTrigger value="overview" className="text-[10px] md:text-xs px-2 md:px-3 data-[state=active]:bg-background whitespace-nowrap">
                Overview
              </TabsTrigger>
              <TabsTrigger value="squads" className="text-[10px] md:text-xs px-2 md:px-3 data-[state=active]:bg-background whitespace-nowrap">
                Squads
              </TabsTrigger>
              <TabsTrigger value="solutions" className="text-[10px] md:text-xs px-2 md:px-3 data-[state=active]:bg-background whitespace-nowrap">
                Ideas
              </TabsTrigger>
              <TabsTrigger value="competitors" className="text-[10px] md:text-xs px-2 md:px-3 data-[state=active]:bg-background whitespace-nowrap">
                Competitors
              </TabsTrigger>
              <TabsTrigger value="prompts" className="text-[10px] md:text-xs px-2 md:px-3 data-[state=active]:bg-background gap-1 whitespace-nowrap">
                <Terminal className="h-3 w-3" />
                Prompts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" forceMount className={`mt-4 space-y-4 ${activeTab !== "overview" ? "hidden" : ""}`}>
            {/* Opportunity + Hidden Insight */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium mb-3">Opportunity Analysis</p>
                <OpportunityMeter
                  score={problem.opportunityScore}
                  marketSize={problem.marketSize}
                  demandVelocity={problem.demandVelocity}
                  competitionGap={problem.competitionGap}
                />
              </div>
              <HiddenInsightCard insight={problem.hiddenInsight} />
            </div>

            {/* Source Signals */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Live Data Signals</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Updating..." : "Refresh"}
                </Button>
              </div>
              <SourceSignals sources={problem.sources} layout="horizontal" />
            </div>

            {/* Source Evidence - Videos & Comments */}
            <ProblemEvidenceSection 
              problemId={dbProblemId} 
              problemTitle={problem.title} 
            />

            {/* Pain Points */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium mb-3">Validated Pain Points</p>
              <div className="space-y-2">
                {problem.painPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-md bg-secondary/30 text-sm"
                  >
                    <span className="text-muted-foreground shrink-0">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Prediction */}
            {problem.peakPrediction && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Peak Prediction</p>
                    <p className="text-xs text-muted-foreground">Best time to launch</p>
                  </div>
                  <span className="text-sm font-medium">{problem.peakPrediction}</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="squads" forceMount className={`mt-4 ${activeTab !== "squads" ? "hidden" : ""}`}>
            <TeamFormation problemId={dbProblemId} problemTitle={problem.title} />
          </TabsContent>

          <TabsContent value="solutions" forceMount className={`mt-4 space-y-4 ${activeTab !== "solutions" ? "hidden" : ""}`}>
            <SolutionsLab 
              problemId={dbProblemId}
              problemTitle={problem.title}
              problemTrend={problem.niche}
              problemPainPoints={problem.painPoints}
              problemCategory={problem.category}
              opportunityScore={problem.opportunityScore}
              demandVelocity={problem.demandVelocity}
              competitionGap={problem.competitionGap}
              sources={problem.sources}
            />
            
          </TabsContent>

          <TabsContent value="competitors" forceMount className={`mt-4 ${activeTab !== "competitors" ? "hidden" : ""}`}>
            <div className="space-y-4">
              {/* Threat Level Indicator */}
              {threatLevel && !competitorsLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-lg border p-4",
                    threatLevel.level === "Critical" && "border-destructive/50 bg-destructive/5",
                    threatLevel.level === "High" && "border-warning/50 bg-warning/5",
                    threatLevel.level === "Moderate" && "border-primary/50 bg-primary/5",
                    threatLevel.level === "Low" && "border-success/50 bg-success/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        threatLevel.level === "Critical" && "bg-destructive animate-pulse",
                        threatLevel.level === "High" && "bg-warning",
                        threatLevel.level === "Moderate" && "bg-primary",
                        threatLevel.level === "Low" && "bg-success"
                      )} />
                      <span className="text-sm font-medium">Threat Level: {threatLevel.level}</span>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        threatLevel.level === "Critical" && "border-destructive/50 text-destructive",
                        threatLevel.level === "High" && "border-warning/50 text-warning",
                        threatLevel.level === "Moderate" && "border-primary/50 text-primary",
                        threatLevel.level === "Low" && "border-success/50 text-success"
                      )}
                    >
                      {threatLevel.score}/100
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{threatLevel.description}</p>
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        threatLevel.level === "Critical" && "bg-destructive",
                        threatLevel.level === "High" && "bg-warning",
                        threatLevel.level === "Moderate" && "bg-primary",
                        threatLevel.level === "Low" && "bg-success"
                      )}
                      style={{ width: `${threatLevel.score}%` }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Competitors Card */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-sm">Competitor Analysis</h3>
                    <p className="text-xs text-muted-foreground">
                      AI-powered market research based on "{problem?.title}"
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchCompetitors()}
                    disabled={competitorsLoading}
                    className="gap-2"
                  >
                    {competitorsLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Search className="h-3 w-3" />
                    )}
                    {competitorsLoading ? "Searching..." : "Refresh"}
                  </Button>
                </div>

                {competitorsLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-secondary/30">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                )}

                {!competitorsLoading && competitors && competitors.length > 0 && (
                  <div className="space-y-3">
                    {competitors.map((competitor) => (
                      <a
                        key={competitor.url}
                        href={competitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0 relative">
                          {competitor.name[0]?.toUpperCase()}
                          {competitor.isNew && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-[8px] text-primary-foreground font-bold">N</span>
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium truncate">{competitor.name}</p>
                            {competitor.isNew && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/50 text-primary">
                                New
                              </Badge>
                            )}
                            {competitor.source === "hackernews" && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-warning/10 border-warning/50 text-warning">
                                HN
                              </Badge>
                            )}
                            {(competitor.url?.includes("producthunt.com") || competitor.source === "producthunt") && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-primary/10 border-primary/50 text-primary">
                                PH
                              </Badge>
                            )}
                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {competitor.description}
                          </p>
                          {competitor.firstSeenAt && (
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              First seen: {new Date(competitor.firstSeenAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px]",
                              competitor.rating >= 80 && "border-destructive/50 text-destructive",
                              competitor.rating >= 60 && competitor.rating < 80 && "border-warning/50 text-warning",
                              competitor.rating >= 40 && competitor.rating < 60 && "border-primary/50 text-primary",
                              competitor.rating < 40 && "border-muted-foreground/50"
                            )}
                          >
                            {competitor.ratingLabel}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  competitor.rating >= 80 && "bg-destructive",
                                  competitor.rating >= 60 && competitor.rating < 80 && "bg-warning",
                                  competitor.rating >= 40 && competitor.rating < 60 && "bg-primary",
                                  competitor.rating < 40 && "bg-muted-foreground"
                                )}
                                style={{ width: `${competitor.rating}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{competitor.rating}</span>
                            {competitor.ratingChange !== undefined && competitor.ratingChange !== 0 && (
                              <span className={cn(
                                "text-[10px] font-medium",
                                competitor.ratingChange > 0 ? "text-destructive" : "text-success"
                              )}>
                                {competitor.ratingChange > 0 ? "↑" : "↓"}{Math.abs(competitor.ratingChange)}
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {!competitorsLoading && (!competitors || competitors.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No competitors found</p>
                    <p className="text-xs">Try refreshing the search</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" forceMount className={`mt-4 ${activeTab !== "prompts" ? "hidden" : ""}`}>
            <PromptsGenerator
              problem={{
                id: problem.id,
                title: problem.title,
                subtitle: problem.subtitle,
                category: problem.category,
                niche: problem.niche,
                painPoints: problem.painPoints,
                marketSize: problem.marketSize,
                opportunityScore: problem.opportunityScore,
                sentiment: problem.sentiment,
                sources: problem.sources,
                hiddenInsight: problem.hiddenInsight,
              }}
              competitors={competitors}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
        {/* Auto-Build Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          onClick={() => setAutoBuildOpen(true)}
          className="h-11 w-11 rounded-full bg-foreground dark:bg-card border border-border shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group"
          aria-label="Auto-build ideas"
        >
          <div className="relative">
            <img 
              src={superloveLogo} 
              alt="Auto-build" 
              className="h-5 w-5 object-contain" 
            />
            <motion.div
              className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.button>

        {/* Submit Build Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          onClick={() => {
            if (!user) {
              toast({
                title: "Sign in required",
                description: "Please sign in to submit a build",
              });
              return;
            }
            navigate("/submit", {
              state: {
                problem: {
                  id: problem.id,
                  title: problem.title,
                  subtitle: problem.subtitle,
                  niche: problem.niche,
                  opportunityScore: problem.opportunityScore,
                  sentiment: problem.sentiment,
                },
                joinType: "solo",
              },
            });
          }}
          className="h-14 w-14 rounded-full bg-foreground text-background shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group"
          aria-label="Submit build"
        >
          <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
        </motion.button>
      </div>

      {/* Auto-Build Modal */}
      <AutoBuildModal 
        open={autoBuildOpen} 
        onOpenChange={setAutoBuildOpen}
        signal={{
          title: problem.title,
          niche: problem.niche,
          category: problem.category,
        }}
      />

      {/* Subscription Paywall */}
      <SubscriptionPaywall 
        open={showPaywall} 
        onOpenChange={(open) => {
          setShowPaywall(open);
          if (!open && !hasPremiumAccess) {
            navigate("/problems");
          }
        }} 
        feature="problem"
      />

      {/* Onboarding overlay for first-time visitors */}
      <ProblemDashboardOnboarding
        isJoined={isJoined}
        justJoined={justJoined}
        onDismiss={() => setJustJoined(false)}
        startBuildingRef={startBuildingRef}
      />
    </AppLayout>
  );
};

export default ProblemDetail;