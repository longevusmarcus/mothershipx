import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeCard } from "./ChallengeCard";
import { mockChallenges } from "@/data/challengesData";

export const CommunityChallenges = () => {
  const [activeTab, setActiveTab] = useState("today");

  const todaysChallenge = mockChallenges.find((c) => c.isToday);
  const pastChallenges = mockChallenges.filter((c) => !c.isToday);

  const totalPrizesPaid = mockChallenges
    .filter((c) => c.status === "completed")
    .reduce((acc, c) => acc + c.winnerPrize, 0);

  const totalParticipants = mockChallenges.reduce((acc, c) => acc + c.participants, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warning/10 via-background to-destructive/5 border border-border p-4 sm:p-6">
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        
        {/* Animated Sparkles */}
        <div className="absolute top-4 right-4 animate-pulse-slow">
          <Sparkles className="h-6 w-6 text-warning/40" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Hackathon Arena ⚔️</h2>
                  <p className="text-xs text-muted-foreground">
                    Daily build sprints • $1 entry • Win 90% of the pool
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/30 text-xs sm:text-sm py-1 px-2 sm:px-3">
                <DollarSign className="h-3 w-3" />
                ${totalPrizesPaid.toFixed(0)} paid
              </Badge>
              <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/30 text-xs sm:text-sm py-1 px-2 sm:px-3">
                <Users className="h-3 w-3" />
                {totalParticipants} builders
              </Badge>
            </div>
          </div>

          {/* How it Works Mini */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { icon: Calendar, label: "Daily Challenge", desc: "New trend daily" },
              { icon: DollarSign, label: "$1 Entry", desc: "Join solo or team" },
              { icon: Flame, label: "24h Sprint", desc: "Build & submit" },
              { icon: Trophy, label: "AI Judges", desc: "Win 90% pool" },
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-background/50 rounded-lg p-2 border border-border/50"
              >
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-10">
          <TabsTrigger value="today" className="gap-2 text-xs sm:text-sm">
            <Flame className="h-4 w-4" />
            Today's Challenge
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2 text-xs sm:text-sm">
            <Calendar className="h-4 w-4" />
            Past Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          {todaysChallenge ? (
            <ChallengeCard challenge={todaysChallenge} />
          ) : (
            <Card variant="elevated" className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No challenge today. Check back tomorrow!</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {pastChallenges.length > 0 ? (
            pastChallenges.map((challenge, index) => (
              <ChallengeCard key={challenge.id} challenge={challenge} delay={index * 0.1} />
            ))
          ) : (
            <Card variant="elevated" className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No past challenges yet.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
