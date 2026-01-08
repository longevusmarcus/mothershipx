import { motion } from "framer-motion";
import { Target, Rocket, Trophy, TrendingUp, Zap, Clock, ArrowRight, Lock, Sparkles, Swords } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { StatCard } from "@/components/StatCard";
import { ProblemCard } from "@/components/ProblemCard";
import { ActivityChart } from "@/components/ActivityChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

const mockProblems = [
  {
    id: "1",
    title: "Users struggle with complex onboarding flows in SaaS apps",
    category: "UX/UI",
    sentiment: "high" as const,
    slotsTotal: 20,
    slotsFilled: 17,
    momentum: 24,
  },
  {
    id: "2",
    title: "No affordable way to transcribe and summarize meetings",
    category: "Productivity",
    sentiment: "high" as const,
    slotsTotal: 15,
    slotsFilled: 8,
    momentum: 45,
  },
  {
    id: "3",
    title: "Small businesses lack simple inventory tracking tools",
    category: "SMB Tools",
    sentiment: "medium" as const,
    slotsTotal: 25,
    slotsFilled: 25,
    momentum: 12,
    isLocked: true,
  },
];

const mockLeaderboard = [
  { rank: 1, name: "Alex Chen", score: 892, change: "up" as const, problem: "SaaS Onboarding" },
  { rank: 2, name: "Sarah Kim", score: 847, change: "same" as const, problem: "Meeting Transcription" },
  { rank: 3, name: "Mike Johnson", score: 823, change: "up" as const, problem: "Inventory Tracking" },
  { rank: 4, name: "Emma Davis", score: 756, change: "down" as const, problem: "SaaS Onboarding" },
  { rank: 5, name: "James Wilson", score: 698, change: "up" as const, problem: "Meeting Transcription" },
];

const mockActivity = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 38 },
  { day: "Thu", value: 85 },
  { day: "Fri", value: 73 },
  { day: "Sat", value: 42 },
  { day: "Sun", value: 56 },
];

const Index = () => {
  const { profile } = useAuth();
  const firstName = profile?.name?.split(" ")[0] || "Builder";
  
  return (
    <AppLayout title="Dashboard">
      <SEO 
        title="Dashboard" 
        description="Track your progress, discover hot problems, and build solutions with the Mothership community."
      />
      <div className="space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-card border border-border p-6"
        >
          <div className="absolute inset-0 bg-gradient-glow" />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Badge variant="glow" className="mb-3">
                  <Zap className="h-3 w-3 mr-1" />
                  Level 12 Builder
                </Badge>
                <h2 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}</h2>
                <p className="text-muted-foreground">
                  You're making great progress. Keep solving real problems.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Next milestone in 3 days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">XP Progress</span>
                <span className="font-medium">2,450 / 3,000 XP</span>
              </div>
              <Progress value={82} size="lg" indicatorColor="gradient" />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <StatCard icon={Target} label="Problems Joined" value={4} delay={0.1} />
          <StatCard icon={Rocket} label="Solutions Shipped" value={12} delay={0.2} comingSoon />
          <StatCard icon={Trophy} label="Global Rank" value="#47" delay={0.3} comingSoon />
          <StatCard icon={TrendingUp} label="Fit Score" value={89} suffix="%" delay={0.4} comingSoon />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Problems Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Hot Problems</h3>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {mockProblems.map((problem, index) => (
                <ProblemCard
                  key={problem.id}
                  {...problem}
                  delay={0.1 * index}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - Top Builders (Blurred Coming Soon) */}
          <div className="space-y-6">
            <Card variant="elevated" className="relative overflow-hidden">
              {/* Blur Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-2 p-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center mx-auto">
                    <Lock className="h-5 w-5 text-warning" />
                  </div>
                  <h4 className="text-sm font-semibold">Top Builders</h4>
                  <p className="text-xs text-muted-foreground max-w-[180px]">
                    Hackathon Arena coming soon
                  </p>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <Swords className="h-3 w-3" />
                    Join Waitlist
                  </Button>
                </motion.div>
              </div>
              
              {/* Blurred Content */}
              <div className="filter blur-[2px] pointer-events-none select-none opacity-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-warning" />
                    <CardTitle className="text-sm">Top Builders</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockLeaderboard.slice(0, 5).map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-3 p-2 rounded-lg">
                      <span className="text-xs font-bold text-muted-foreground w-4">#{entry.rank}</span>
                      <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {entry.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{entry.name}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.score} XP</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ActivityChart data={mockActivity} />
          
          {/* Your Active Builds (Blurred Coming Soon) */}
          <Card variant="elevated" className="relative overflow-hidden">
            {/* Blur Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-2 p-4"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold">Your Builds</h4>
                <p className="text-xs text-muted-foreground max-w-[180px]">
                  Launch Lab coming soon
                </p>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Join Waitlist
                </Button>
              </motion.div>
            </div>
            
            {/* Blurred Content */}
            <div className="filter blur-[2px] pointer-events-none select-none opacity-50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Rocket className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Your Active Builds</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: "OnboardFlow", problem: "SaaS Onboarding", score: 78, status: "live" },
                    { name: "MeetSum AI", problem: "Meeting Transcription", score: 45, status: "building" },
                  ].map((build) => (
                    <div
                      key={build.name}
                      className="p-3 rounded-lg bg-secondary/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{build.name}</p>
                          <p className="text-xs text-muted-foreground">{build.problem}</p>
                        </div>
                        <Badge variant="secondary">
                          {build.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Fit Score</span>
                          <span className="font-medium">{build.score}%</span>
                        </div>
                        <Progress
                          value={build.score}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  Start New Build
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
