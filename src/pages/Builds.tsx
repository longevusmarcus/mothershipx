import { motion } from "framer-motion";
import { 
  Plus, 
  ExternalLink, 
  Github, 
  TrendingUp, 
  BarChart3,
  Rocket,
  Trophy,
  Handshake,
  Megaphone,
  CheckCircle2,
  Sparkles,
  Lock,
  Users,
  DollarSign,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const myBuilds = [
  {
    id: "1",
    name: "OnboardFlow",
    problem: "SaaS Onboarding",
    status: "live",
    fitScore: 78,
    adoption: 245,
    revenue: "$1,240",
    rank: 4,
    url: "https://onboardflow.app",
    github: "alexchen/onboardflow",
  },
  {
    id: "2",
    name: "MeetSum AI",
    problem: "Meeting Transcription",
    status: "building",
    fitScore: 45,
    adoption: 0,
    revenue: "$0",
    rank: null,
    url: null,
    github: "alexchen/meetsum",
  },
  {
    id: "3",
    name: "InvoiceGen",
    problem: "Freelancer Legal Docs",
    status: "submitted",
    fitScore: 62,
    adoption: 34,
    revenue: "$0",
    rank: 12,
    url: "https://invoicegen.io",
    github: "alexchen/invoicegen",
  },
];

const acceleratorFeatures = [
  {
    icon: Trophy,
    title: "Showcase Gallery",
    description: "Feature your builds to 50K+ monthly visitors",
    stat: "50K+ views/mo",
  },
  {
    icon: CheckCircle2,
    title: "Idea Validation",
    description: "AI-powered market fit scoring & user testing",
    stat: "89% accuracy",
  },
  {
    icon: Megaphone,
    title: "Launch Marketing",
    description: "Product Hunt, social amplification, PR support",
    stat: "10x reach",
  },
  {
    icon: Handshake,
    title: "VC Matching",
    description: "Connect with VCs actively seeking your niche",
    stat: "200+ investors",
  },
];

const Builds = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="My Builds">
      <div className="space-y-6">
        {/* Coming Soon Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5"
        >
          <div className="absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="relative z-10 p-6 sm:p-8 text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Accelerator Coming Soon</span>
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl font-bold">
              Launch Lab 🚀
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Showcase your builds, validate ideas with real users, and connect with VCs — all in one place
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Validation
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Megaphone className="h-3 w-3" />
                Marketing
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Handshake className="h-3 w-3" />
                VC Matching
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Accelerator Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {acceleratorFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className="h-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-4 space-y-3 relative">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {feature.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {feature.stat}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Blurred Preview Section */}
        <div className="relative">
          {/* Blur Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-3 p-6"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Your Builds Dashboard</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Track performance, get validation scores, and accelerate your ideas
              </p>
              <Button variant="glow" className="gap-2 mt-2">
                <Sparkles className="h-4 w-4" />
                Join Waitlist
              </Button>
            </motion.div>
          </div>

          {/* Blurred Content Preview */}
          <div className="filter blur-[2px] pointer-events-none select-none opacity-60">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Total Builds", value: "3", icon: Rocket },
                { label: "Live Solutions", value: "2", icon: CheckCircle2 },
                { label: "Total Revenue", value: "$1,240", icon: DollarSign },
                { label: "Avg Fit Score", value: "62%", icon: Target },
              ].map((stat, index) => (
                <Card key={stat.label} variant="elevated" className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>

            {/* Builds List Preview */}
            <div className="space-y-3">
              {myBuilds.map((build) => (
                <Card key={build.id} variant="elevated">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{build.name}</h3>
                          <Badge variant="secondary" className="text-[10px]">
                            {build.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{build.problem}</p>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold">{build.fitScore}%</p>
                          <p className="text-[10px] text-muted-foreground">Fit Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-success">{build.revenue}</p>
                          <p className="text-[10px] text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{build.adoption}</p>
                          <p className="text-[10px] text-muted-foreground">Users</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6 space-y-3"
        >
          <p className="text-sm text-muted-foreground">
            Be the first to know when Launch Lab goes live
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              2,847 on waitlist
            </span>
            <span className="flex items-center gap-1">
              <Handshake className="h-3 w-3" />
              200+ VCs
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              $2M+ deployed
            </span>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Builds;
