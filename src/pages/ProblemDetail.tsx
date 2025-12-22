import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Clock, 
  Lock,
  Rocket,
  MessageSquare,
  UserPlus,
  Filter,
  ExternalLink
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { FitVerificationPanel } from "@/components/FitVerificationPanel";
import { BuildersList } from "@/components/BuilderCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Mock data for the problem
const mockProblem = {
  id: "1",
  title: "Users struggle with complex onboarding flows in SaaS apps",
  description: "SaaS companies report 40% drop-off rates during onboarding. Users find multi-step flows confusing, leading to poor activation and churn. The pain is acute for B2B tools with complex features.",
  category: "UX/UI",
  sentiment: "high",
  slotsTotal: 20,
  slotsFilled: 17,
  momentum: 24,
  sources: ["Reddit r/SaaS", "App Store Reviews", "G2 Reviews"],
  painPoints: [
    "Too many steps in signup flow",
    "No personalization based on use case",
    "Unclear value proposition during onboarding",
    "Missing progress indicators",
  ],
};

const mockBuilders = [
  {
    id: "1",
    name: "Alex Chen",
    stage: "launched" as const,
    skills: ["React", "AI/ML", "UX Design"],
    solutionName: "OnboardFlow",
    fitScore: 78,
    githubUrl: "https://github.com/alexchen/onboardflow",
    productUrl: "https://onboardflow.app",
    isLookingForTeam: false,
  },
  {
    id: "2",
    name: "Sarah Kim",
    stage: "building" as const,
    skills: ["Vue", "Node.js", "Product"],
    solutionName: "StepWizard",
    fitScore: 62,
    githubUrl: "https://github.com/sarahkim/stepwizard",
    isLookingForTeam: true,
  },
  {
    id: "3",
    name: "Mike Johnson",
    stage: "idea" as const,
    skills: ["Python", "Data Science"],
    isLookingForTeam: true,
  },
  {
    id: "4",
    name: "Emma Davis",
    stage: "building" as const,
    skills: ["React Native", "Firebase", "Growth"],
    solutionName: "FlowBuilder",
    fitScore: 45,
    isLookingForTeam: false,
  },
];

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

  const slotsRemaining = mockProblem.slotsTotal - mockProblem.slotsFilled;
  const fillPercentage = (mockProblem.slotsFilled / mockProblem.slotsTotal) * 100;
  const isLocked = slotsRemaining === 0;

  const handleRequestCollab = (builderId: string) => {
    const builder = mockBuilders.find(b => b.id === builderId);
    toast({
      title: "Collaboration Request Sent",
      description: `Your request has been sent to ${builder?.name}. They'll be notified via email.`,
    });
  };

  const handleJoinDashboard = () => {
    toast({
      title: "Joined Dashboard",
      description: "You're now part of this problem dashboard. Start building!",
    });
  };

  return (
    <AppLayout title="">
      <div className="space-y-6">
        {/* Back Navigation */}
        <Link 
          to="/problems" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Problems
        </Link>

        {/* Problem Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-card border border-border p-6"
        >
          <div className="absolute inset-0 bg-gradient-glow" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{mockProblem.category}</Badge>
                  {isLocked ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Full
                    </Badge>
                  ) : (
                    <Badge variant="live">{slotsRemaining} slots left</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{mockProblem.title}</h1>
                <p className="text-muted-foreground">{mockProblem.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{mockProblem.slotsFilled} builders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-success">+{mockProblem.momentum}% momentum</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Continuous</span>
                  </div>
                </div>
              </div>

              <div className="lg:text-right space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between lg:justify-end gap-4 text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{mockProblem.slotsFilled}/{mockProblem.slotsTotal}</span>
                  </div>
                  <Progress 
                    value={fillPercentage} 
                    className="w-full lg:w-48"
                    indicatorColor={fillPercentage > 80 ? "warning" : "default"} 
                  />
                </div>
                
                {!isLocked && (
                  <Button variant="glow" size="lg" onClick={handleJoinDashboard}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Join & Build
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="builders">
              Builders ({mockBuilders.length})
            </TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pain Points */}
              <Card variant="elevated">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Identified Pain Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockProblem.painPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm">{point}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card variant="elevated">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    Data Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockProblem.sources.map((source) => (
                      <Badge key={source} variant="secondary" className="text-sm">
                        {source}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Pain points aggregated from multiple sources and validated by sentiment analysis.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="builders" className="mt-6 space-y-6">
            {/* Team Formation Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Looking for collaborators?</p>
                  <p className="text-sm text-muted-foreground">
                    {mockBuilders.filter(b => b.isLookingForTeam).length} builders are open to teaming up
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
              <BuildersList 
                builders={mockBuilders} 
                onRequestCollab={handleRequestCollab}
              />
            </div>
          </TabsContent>

          <TabsContent value="solutions" className="mt-6 space-y-6">
            {/* Top Solution Fit Verification */}
            <FitVerificationPanel {...mockTopSolution} />

            {/* Other Solutions */}
            <Card variant="elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">All Submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockBuilders
                  .filter(b => b.solutionName)
                  .map((builder, index) => (
                    <motion.div
                      key={builder.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {builder.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{builder.solutionName}</p>
                          <p className="text-xs text-muted-foreground">by {builder.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">{builder.fitScore}%</p>
                          <p className="text-xs text-muted-foreground">Fit Score</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </motion.div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProblemDetail;
