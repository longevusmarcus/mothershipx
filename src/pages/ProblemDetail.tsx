import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Clock,
  Rocket,
  UserPlus,
  Filter,
  ExternalLink,
  Flame,
  Target,
  Share2,
  Bookmark,
  Zap,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { FitVerificationPanel } from "@/components/FitVerificationPanel";
import { SolutionsLab } from "@/components/SolutionsLab";
import { BuildersList } from "@/components/BuilderCard";
import { TrendBadge } from "@/components/TrendBadge";
import { SocialProofStats } from "@/components/SocialProofStats";
import { OpportunityMeter } from "@/components/OpportunityMeter";
import { SourceSignals } from "@/components/SourceSignals";
import { HiddenInsightCard } from "@/components/HiddenInsightCard";
import { TeamFormation } from "@/components/TeamFormation";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { mockMarketProblems } from "@/data/marketIntelligence";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);

  // Find the problem from mock data
  const problem = mockMarketProblems.find(p => p.id === id) || mockMarketProblems[0];
  
  const slotsRemaining = problem.slotsTotal - problem.slotsFilled;
  const fillPercentage = (problem.slotsFilled / problem.slotsTotal) * 100;

  const handleJoinDashboard = () => {
    toast({
      title: "🚀 You're In!",
      description: "You've joined this opportunity. Start building!",
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved!",
      description: isSaved ? "Opportunity removed from your list" : "You'll get updates on this opportunity",
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
    <AppLayout title="">
      <div className="space-y-4 sm:space-y-6">
        {/* Back Navigation */}
        <Link 
          to="/problems" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Opportunities
        </Link>

        {/* Hero Header - TikTok Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-border"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute inset-0 bg-gradient-glow" />
          
          {/* Viral Badge */}
          {problem.isViral && (
            <div className="absolute top-4 right-4 z-20">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 gap-1 px-3 py-1">
                  <Flame className="h-3 w-3" />
                  VIRAL
                </Badge>
              </motion.div>
            </div>
          )}
          
          <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Top Row: Category + Trend Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{problem.category}</Badge>
              <TrendBadge sentiment={problem.sentiment} animated={problem.isViral} />
              {problem.trendingRank && (
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  #{problem.trendingRank} Trending
                </Badge>
              )}
            </div>
            
            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
                {problem.title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                {problem.subtitle}
              </p>
            </div>
            
            {/* Social Proof Stats */}
            <SocialProofStats
              views={problem.views}
              saves={problem.saves}
              shares={problem.shares}
              trendingRank={problem.trendingRank}
              isViral={problem.isViral}
              size="md"
            />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="glow" size="lg" onClick={handleJoinDashboard} className="gap-2">
                <Rocket className="h-4 w-4" />
                Start Building
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleSave}
                className={isSaved ? "bg-primary/10" : ""}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Builder Capacity Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-border/50">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Builder Capacity
                  </span>
                  <span className="font-medium">
                    {problem.slotsFilled}/{problem.slotsTotal}
                    {slotsRemaining <= 5 && (
                      <span className="text-warning ml-2">• {slotsRemaining} slots left!</span>
                    )}
                  </span>
                </div>
                <Progress 
                  value={fillPercentage} 
                  indicatorColor={fillPercentage > 80 ? "warning" : "default"} 
                />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-muted-foreground">{problem.activeBuildersLast24h} active now</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:inline-flex overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="squads" className="text-xs sm:text-sm">
              🔥 Squads
            </TabsTrigger>
            <TabsTrigger value="builders" className="text-xs sm:text-sm">
              Builders
            </TabsTrigger>
            <TabsTrigger value="solutions" className="text-xs sm:text-sm">Solutions</TabsTrigger>
            <TabsTrigger value="competitors" className="text-xs sm:text-sm">Competitors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            {/* Opportunity Score Section */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <Card variant="elevated">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    Opportunity Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OpportunityMeter
                    score={problem.opportunityScore}
                    marketSize={problem.marketSize}
                    demandVelocity={problem.demandVelocity}
                    competitionGap={problem.competitionGap}
                  />
                </CardContent>
              </Card>

              {/* Hidden Insight */}
              <HiddenInsightCard insight={problem.hiddenInsight} />
            </div>

            {/* Source Signals */}
            <Card variant="elevated">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Live Data Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SourceSignals sources={problem.sources} layout="horizontal" />
              </CardContent>
            </Card>

            {/* Pain Points */}
            <Card variant="elevated">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  Validated Pain Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {problem.painPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-3 w-3 text-warning" />
                    </div>
                    <p className="text-sm">{point}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Timeline */}
            {problem.peakPrediction && (
              <Card variant="elevated">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Peak Prediction</p>
                        <p className="text-xs text-muted-foreground">Best time to launch</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm font-semibold">
                      {problem.peakPrediction}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="squads" className="mt-4 sm:mt-6">
            <TeamFormation problemId={problem.id} problemTitle={problem.title} />
          </TabsContent>

          <TabsContent value="builders" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            {/* Team Formation Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Looking for collaborators?</p>
                  <p className="text-sm text-muted-foreground">
                    Find builders open to teaming up on this problem
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </motion.div>

            {/* Builders Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <BuildersList problemId={problem.id} />
            </div>
          </TabsContent>

          <TabsContent value="solutions" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            {/* Solutions Lab - Wiki-style collaborative ideas */}
            <SolutionsLab 
              problemId={problem.id} 
              problemTitle={problem.title}
              problemTrend={problem.niche}
              problemPainPoints={problem.painPoints}
              problemCategory={problem.category}
              opportunityScore={problem.opportunityScore}
            />

            {/* Top Solution Fit Verification */}
            <FitVerificationPanel {...mockTopSolution} />
          </TabsContent>

          <TabsContent value="competitors" className="mt-4 sm:mt-6">
            {/* Competitors - Coming Soon Blurred */}
            <div className="relative">
              {/* Blur Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-3 p-6"
                >
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Competitor Analysis</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    AI-powered competitor tracking, feature gaps, and market positioning
                  </p>
                  <WaitlistForm feature="general" buttonText="Join Waitlist" />
                </motion.div>
              </div>

              {/* Blurred Content Preview */}
              <div className="filter blur-[2px] pointer-events-none select-none opacity-60 space-y-4">
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[
                        { name: "CompetitorOne", funding: "$12M Series A", users: "50K+", threat: "High" },
                        { name: "RivalApp", funding: "$3M Seed", users: "15K+", threat: "Medium" },
                        { name: "AltSolution", funding: "Bootstrapped", users: "8K+", threat: "Low" },
                      ].map((competitor) => (
                        <div key={competitor.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold">
                              {competitor.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{competitor.name}</p>
                              <p className="text-xs text-muted-foreground">{competitor.funding}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{competitor.users}</p>
                            <Badge variant="outline" className="text-[10px]">{competitor.threat}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-3">Feature Gap Analysis</h4>
                    <div className="space-y-2">
                      {["Mobile app", "API access", "Team collaboration", "Analytics dashboard"].map((feature) => (
                        <div key={feature} className="flex items-center justify-between text-sm">
                          <span>{feature}</span>
                          <Badge variant="secondary" className="text-[10px]">Gap</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProblemDetail;
