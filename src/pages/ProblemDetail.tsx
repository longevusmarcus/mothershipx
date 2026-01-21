import { useState, useEffect } from "react";
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
  ExternalLink,
  Search,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { FitVerificationPanel } from "@/components/FitVerificationPanel";
import { SolutionsLab } from "@/components/SolutionsLab";
import { OpportunityMeter } from "@/components/OpportunityMeter";
import { SourceSignals } from "@/components/SourceSignals";
import { HiddenInsightCard } from "@/components/HiddenInsightCard";
import { TeamFormation } from "@/components/TeamFormation";
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
import { cn } from "@/lib/utils";

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
  const [searchCompetitors, setSearchCompetitors] = useState(false);

  const { data: problem, isLoading } = useProblem(id || "");
  const dbProblemId = problem?.id || id || "";
  const { isJoined, joinProblem, leaveProblem } = useProblemBuilders(dbProblemId);
  const { refresh, isRefreshing } = useRefreshProblem(dbProblemId);
  const { 
    data: competitors, 
    isLoading: competitorsLoading, 
    refetch: refetchCompetitors 
  } = useCompetitors(problem?.title || "", problem?.niche, searchCompetitors);

  // Trigger search when tab becomes active
  useEffect(() => {
    if (activeTab === "competitors" && problem?.title && !searchCompetitors) {
      setSearchCompetitors(true);
    }
  }, [activeTab, problem?.title, searchCompetitors]);
  
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
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {competitor.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{competitor.name}</p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {competitor.description}
                        </p>
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
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProblemDetail;