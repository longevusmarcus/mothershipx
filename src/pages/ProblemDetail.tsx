import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  Search,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { FitVerificationPanel } from "@/components/FitVerificationPanel";
import { SolutionsLab } from "@/components/SolutionsLab";
import { OpportunityMeter } from "@/components/OpportunityMeter";
import { SourceSignals } from "@/components/SourceSignals";
import { HiddenInsightCard } from "@/components/HiddenInsightCard";
import { TeamFormation } from "@/components/TeamFormation";
import { WaitlistForm } from "@/components/WaitlistForm";
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
import { useAuth } from "@/contexts/AuthContext";

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
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [signalsLayout, setSignalsLayout] = useState<"horizontal" | "grid">("horizontal");
  const [showQuickInsight, setShowQuickInsight] = useState(false);

  const { data: problem, isLoading } = useProblem(id || "");
  const dbProblemId = problem?.id || id || "";
  const { isJoined, joinProblem, leaveProblem } = useProblemBuilders(dbProblemId);
  const { refresh, isRefreshing } = useRefreshProblem(dbProblemId);
  
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
            <Button size="sm">Browse Library</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }
  
  const slotsRemaining = problem.slotsTotal - problem.slotsFilled;
  const fillPercentage = (problem.slotsFilled / problem.slotsTotal) * 100;
  const sentiment = getSentimentLabel(problem.sentiment);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this opportunity with your network",
    });
  };

  const handleSearchRelated = () => {
    // Navigate to problems page with category filter
    window.location.href = `/problems?category=${encodeURIComponent(problem.category)}`;
  };

  const handleQuickInsight = () => {
    setShowQuickInsight(!showQuickInsight);
    if (!showQuickInsight) {
      toast({
        title: "AI Analysis Active",
        description: "Viewing deeper market insights",
      });
    }
  };

  const handleToggleLayout = () => {
    setSignalsLayout(prev => prev === "horizontal" ? "grid" : "horizontal");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Link 
          to="/problems" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-5"
        >
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
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
            
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleSearchRelated}
                title="Search related problems"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 ${showQuickInsight ? "bg-background shadow-sm" : ""}`}
                onClick={handleQuickInsight}
                title="Toggle AI insights"
              >
                <Zap className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 ${signalsLayout === "grid" ? "bg-background shadow-sm" : ""}`}
                onClick={handleToggleLayout}
                title="Toggle layout"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Title & Subtitle */}
          <h1 className="font-display text-xl sm:text-2xl font-normal tracking-tight mb-2">
            {problem.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {problem.subtitle}
          </p>
          
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {problem.trendingRank && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                #{problem.trendingRank}
              </span>
            )}
            {problem.views && (
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(problem.views)} Views
              </span>
            )}
            {problem.saves && (
              <span className="flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5" />
                {formatNumber(problem.saves)} Saves
              </span>
            )}
            {problem.shares && (
              <span className="flex items-center gap-1">
                <Share2 className="h-3.5 w-3.5" />
                {formatNumber(problem.shares)} Shares
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-4">
            <Button 
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
                "Start Building"
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9 p-1 bg-secondary/50">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-background">
              Overview
            </TabsTrigger>
            <TabsTrigger value="squads" className="text-xs data-[state=active]:bg-background">
              Squads
            </TabsTrigger>
            <TabsTrigger value="solutions" className="text-xs data-[state=active]:bg-background">
              Solutions
            </TabsTrigger>
            <TabsTrigger value="competitors" className="text-xs data-[state=active]:bg-background">
              Competitors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" forceMount className={`mt-4 space-y-4 ${activeTab !== "overview" ? "hidden" : ""}`}>
            {/* Quick AI Insight Panel */}
            {showQuickInsight && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-primary/20 bg-primary/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">AI Market Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      This problem shows {problem.sentiment === "exploding" ? "explosive" : "strong"} demand signals 
                      with a {problem.competitionGap}% competition gap. Consider building a solution that addresses 
                      the core pain point: "{problem.painPoints[0]}". Peak opportunity window: {problem.peakPrediction || "Next 2-3 months"}.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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
              <SourceSignals sources={problem.sources} layout={signalsLayout} />
            </div>

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
            />
            <FitVerificationPanel {...mockTopSolution} />
          </TabsContent>

          <TabsContent value="competitors" forceMount className={`mt-4 ${activeTab !== "competitors" ? "hidden" : ""}`}>
            <div className="relative">
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="text-center p-6">
                  <h3 className="font-medium mb-2">Competitor Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    AI-powered competitor tracking and market positioning
                  </p>
                  <WaitlistForm feature="general" buttonText="Join Waitlist" />
                </div>
              </div>

              <div className="filter blur-[2px] pointer-events-none opacity-50 space-y-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="space-y-3">
                    {[
                      { name: "CompetitorOne", funding: "$12M Series A", users: "50K+" },
                      { name: "RivalApp", funding: "$3M Seed", users: "15K+" },
                      { name: "AltSolution", funding: "Bootstrapped", users: "8K+" },
                    ].map((c) => (
                      <div key={c.name} className="flex items-center justify-between p-3 rounded-md bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-sm font-medium">
                            {c.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.funding}</p>
                          </div>
                        </div>
                        <span className="text-sm">{c.users}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProblemDetail;