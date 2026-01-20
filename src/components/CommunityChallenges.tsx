import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Calendar,
  Loader2,
  Shield,
  Star,
  Github,
  CreditCard,
  Database,
  DollarSign,
  Megaphone,
  Award,
  Link2,
  Percent,
  Headphones,
  Users,
  Lock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeCard } from "./ChallengeCard";
import { useTodayChallenge, usePastChallenges, useChallenges } from "@/hooks/useChallenges";

export const CommunityChallenges = () => {
  const [activeTab, setActiveTab] = useState("today");

  const { data: todaysChallenge, isLoading: loadingToday } = useTodayChallenge();
  const { data: pastChallenges = [], isLoading: loadingPast } = usePastChallenges();
  const { data: allChallenges = [] } = useChallenges();

  const totalPrizesPaid = allChallenges
    .filter((c) => c.status === "completed")
    .reduce((acc, c) => acc + c.winnerPrize, 0);

  const totalParticipants = allChallenges.reduce((acc, c) => acc + c.participants, 0);

  const proofRequirements = [
    { icon: Database, label: "Supabase", desc: "Public project key" },
    { icon: CreditCard, label: "Stripe", desc: "Public API key" },
    { icon: Github, label: "GitHub", desc: "Profile with stars" },
  ];

  const memberBenefits = [
    { icon: DollarSign, label: "Win Money", desc: "90% of prize pool" },
    { icon: Megaphone, label: "Free Distribution", desc: "We promote your build" },
    { icon: Trophy, label: "Free Hackathons", desc: "Access to future events" },
    { icon: Award, label: "Builder Badge", desc: "Resume & vanity metric" },
    { icon: Link2, label: "Permanent Link", desc: "Showcase forever" },
    { icon: Percent, label: "Top 10 Cashback", desc: "Rewards for ranking" },
    { icon: Headphones, label: "Freelance Support", desc: "Help when you need it" },
    { icon: Users, label: "End User Access", desc: "Talk to real users" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* Header with Exclusive Badge */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Arena</h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-medium border border-warning/20">
            <Lock className="h-2.5 w-2.5" />
            EXCLUSIVE
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          A private builder club • Prove you ship • Compete for prizes
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total paid:</span>
          <span className="font-medium text-success">${totalPrizesPaid.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Members:</span>
          <span className="font-medium">{totalParticipants}</span>
        </div>
      </div>

      {/* Proof Required Section */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Proof Required to Join</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Show us you've built something real. We verify builders to keep the arena exclusive.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {proofRequirements.map((req, i) => (
            <div
              key={i}
              className="p-2.5 rounded-md bg-secondary/50 border border-border/50"
            >
              <req.icon className="h-4 w-4 text-muted-foreground mb-1.5" />
              <p className="text-xs font-medium">{req.label}</p>
              <p className="text-[10px] text-muted-foreground">{req.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Member Benefits Section */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">What You Get</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {memberBenefits.map((benefit, i) => (
            <div
              key={i}
              className="p-2.5 rounded-md bg-background/50 border border-border/50"
            >
              <benefit.icon className="h-3.5 w-3.5 text-primary mb-1" />
              <p className="text-xs font-medium">{benefit.label}</p>
              <p className="text-[10px] text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: "Weekly Challenges", desc: "3 challenges/week" },
          { label: "$5 Entry", desc: "Verified builders only" },
          { icon: Flame, label: "48h Sprint", desc: "Build & submit" },
          { icon: Trophy, label: "AI Judges", desc: "Win 90% pool" },
        ].map((step, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border border-border bg-card"
          >
            <p className="text-sm font-medium">{step.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-9 p-1 bg-secondary/50">
          <TabsTrigger value="today" className="gap-2 text-xs data-[state=active]:bg-background">
            <Flame className="h-3.5 w-3.5" />
            Today
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2 text-xs data-[state=active]:bg-background">
            <Calendar className="h-3.5 w-3.5" />
            Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          {loadingToday ? (
            <div className="py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : todaysChallenge ? (
            <ChallengeCard challenge={todaysChallenge} />
          ) : (
            <div className="py-12 text-center border border-dashed border-border rounded-lg">
              <Trophy className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No challenge today. Check back tomorrow!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {loadingPast ? (
            <div className="py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : pastChallenges.length > 0 ? (
            pastChallenges.map((challenge, index) => (
              <ChallengeCard key={challenge.id} challenge={challenge} delay={index * 0.05} />
            ))
          ) : (
            <div className="py-12 text-center border border-dashed border-border rounded-lg">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No past challenges yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};