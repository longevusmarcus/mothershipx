import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Calendar,
  Loader2,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Arena</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daily build sprints • $2 entry • Win 90% of the pool
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total paid:</span>
          <span className="font-medium text-success">${totalPrizesPaid.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Builders:</span>
          <span className="font-medium">{totalParticipants}</span>
        </div>
      </div>

      {/* How it Works */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: "Daily Challenge", desc: "New trend daily" },
          { label: "$2 Entry", desc: "Join solo or team" },
          { icon: Flame, label: "24h Sprint", desc: "Build & submit" },
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