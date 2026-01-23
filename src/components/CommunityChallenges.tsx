import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Calendar,
  Loader2,
  Shield,
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
  Terminal,
  ArrowRight,
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
    { icon: CreditCard, label: "Stripe / Polar", desc: "Public API key" },
    { icon: Github, label: "GitHub", desc: "Profile with stars" },
    { icon: Database, label: "Supabase", desc: "Optional", optional: true },
  ];

  const memberBenefits = [
    { icon: DollarSign, label: "Revenue & cash rewards" },
    { icon: Trophy, label: "Graduation into live markets" },
    { icon: Megaphone, label: "Ongoing distribution fro Mothership" },
    { icon: Link2, label: "Permanent market presence" },
    { icon: Award, label: "Builder reputation & rank" },
    { icon: Users, label: "Access to future high-signal markets" },
  ];

  return (
    <div className="relative min-h-[80vh]">
      {/* Dot Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 space-y-10"
      >
        {/* Hero Section */}
        <div className="pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">~/arena</p>
            <h1 className="font-mono text-xl sm:text-2xl font-medium tracking-wider uppercase">Market Audition</h1>
            <p className="font-mono text-xs text-muted-foreground tracking-wide">
              Serve pre-validated demand • Earn rewards • Graduate into live markets
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-8 font-mono text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">&gt; Total paid:</span>
              <span className="text-success">${totalPrizesPaid.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">&gt; Members:</span>
              <span>{totalParticipants}</span>
            </div>
          </motion.div>
        </div>

        {/* Two Column Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* Proof Required Card */}
          <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs border border-border px-2 py-1 rounded">./verify</span>
              <span className="font-mono text-xs text-primary">Required</span>
            </div>

            <div className="flex items-center gap-2 mb-4 font-mono">
              <span className="text-muted-foreground">&gt;</span>
              <h3 className="text-lg font-medium tracking-wide">proof-of-ship</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Show us you've built something real. We verify builders to keep the arena exclusive.
            </p>

            <div className="space-y-2">
              {proofRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-3 font-mono text-sm">
                  <span className="text-muted-foreground">&gt;</span>
                  <req.icon
                    className={`h-4 w-4 ${req.optional ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                  />
                  <span className={req.optional ? "text-muted-foreground" : ""}>{req.label}</span>
                  <span
                    className={`text-xs ${req.optional ? "text-muted-foreground/50 italic" : "text-muted-foreground"}`}
                  >
                    — {req.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Member Benefits Card */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs border border-primary/30 px-2 py-1 rounded">./benefits</span>
              <span className="font-mono text-xs text-success">Unlocked</span>
            </div>

            <div className="flex items-center gap-2 mb-4 font-mono">
              <span className="text-muted-foreground">&gt;</span>
              <h3 className="text-lg font-medium tracking-wide">what-you-get</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">Outcomes you earn by serving real market demand:</p>

            <div className="grid grid-cols-2 gap-2">
              {memberBenefits.slice(0, 6).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-primary">&gt;</span>
                  <span>{benefit.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center font-mono text-sm text-muted-foreground py-4"
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />3 Weekly Challenges
            </span>
            <ArrowRight className="h-3 w-3 hidden sm:block" />
            <span>$5 Entry</span>
            <ArrowRight className="h-3 w-3 hidden sm:block" />
            <span className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5" />
              48h Sprint
            </span>
            <ArrowRight className="h-3 w-3 hidden sm:block" />
            <span className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5" />
              Win 90%
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="h-9 p-1 bg-secondary/50 font-mono">
                <TabsTrigger value="today" className="gap-2 text-xs data-[state=active]:bg-background">
                  <Terminal className="h-3.5 w-3.5" />
                  ./today
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2 text-xs data-[state=active]:bg-background">
                  <Calendar className="h-3.5 w-3.5" />
                  ./archive
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="today" className="mt-0">
              {loadingToday ? (
                <div className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-3" />
                  <p className="font-mono text-xs text-muted-foreground">loading...</p>
                </div>
              ) : todaysChallenge ? (
                <ChallengeCard challenge={todaysChallenge} />
              ) : (
                <div className="py-16 text-center border border-dashed border-border rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-mono text-xs text-muted-foreground">
                    &gt; No challenge today. Check back tomorrow.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-0 space-y-3">
              {loadingPast ? (
                <div className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-3" />
                  <p className="font-mono text-xs text-muted-foreground">loading...</p>
                </div>
              ) : pastChallenges.length > 0 ? (
                pastChallenges.map((challenge, index) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} delay={index * 0.05} />
                ))
              ) : (
                <div className="py-16 text-center border border-dashed border-border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-mono text-xs text-muted-foreground">&gt; No past challenges yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};
