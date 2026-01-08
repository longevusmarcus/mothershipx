import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  Users,
  User,
  Zap,
  Sparkles,
  DollarSign,
  ChevronRight,
  Crown,
  Vote,
  CheckCircle2,
  TrendingUp,
  Eye,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DailyChallenge, getTimeRemaining, getDifficultyColor } from "@/data/challengesData";
import { getSourceIcon, getSourceLabel } from "@/data/marketIntelligence";

interface ChallengeCardProps {
  challenge: DailyChallenge;
  delay?: number;
}

export const ChallengeCard = ({ challenge, delay = 0 }: ChallengeCardProps) => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinType, setJoinType] = useState<"solo" | "team" | null>(null);

  const timeRemaining = getTimeRemaining(challenge.endsAt);
  const isActive = challenge.status === "active";
  const isVoting = challenge.status === "voting";
  const isCompleted = challenge.status === "completed";

  const handleJoin = (type: "solo" | "team") => {
    setJoinType(type);
  };

  const handleConfirmJoin = () => {
    toast.success(`Joined challenge as ${joinType}! $1 entry fee processed.`, {
      description: "You have 24 hours to build and submit your solution.",
    });
    setIsJoinDialogOpen(false);
    setJoinType(null);
  };

  const statusIcon = isActive ? (
    <Zap className="h-3.5 w-3.5" />
  ) : isVoting ? (
    <Vote className="h-3.5 w-3.5" />
  ) : (
    <CheckCircle2 className="h-3.5 w-3.5" />
  );

  const statusLabel = isActive ? "Live Now" : isVoting ? "Voting" : "Completed";
  const statusColor = isActive
    ? "bg-success/10 text-success border-success/30"
    : isVoting
    ? "bg-warning/10 text-warning border-warning/30"
    : "bg-muted text-muted-foreground border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card
        variant="elevated"
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
          challenge.isToday ? "ring-2 ring-primary/50" : ""
        }`}
      >
        {/* Today's Challenge Ribbon */}
        {challenge.isToday && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-gradient-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              TODAY
            </div>
          </div>
        )}

        {/* Glow effect for active challenges */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent pointer-events-none" />
        )}

        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className={`text-[10px] gap-1 ${statusColor}`}>
                  {statusIcon}
                  {statusLabel}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${getDifficultyColor(challenge.difficulty)}`}
                >
                  {challenge.difficulty}
                </Badge>
              </div>
              <h3 className="font-bold text-base sm:text-lg leading-tight truncate">
                {challenge.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <span className="text-primary font-medium">Trend:</span>
                {challenge.trend}
              </p>
            </div>

            {/* Prize Pool */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-success font-bold text-lg sm:text-xl">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                {challenge.prizePool}
              </div>
              <p className="text-[10px] text-muted-foreground">prize pool</p>
            </div>
          </div>

          {/* Why This Challenge - Relevance Section */}
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg p-3 mb-3 border border-primary/20">
            <div className="flex items-start gap-2 mb-2">
              <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">
                  Why This Challenge?
                </p>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {challenge.whyRelevant}
                </p>
              </div>
            </div>
            
            {/* Data Sources */}
            <div className="flex flex-wrap gap-2 mt-2">
              {challenge.sources.map((src, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-background/60 rounded-md px-2 py-1 border border-border/50"
                >
                  <span className="text-sm">{getSourceIcon(src.source)}</span>
                  <span className="text-[10px] text-muted-foreground">{src.metric}:</span>
                  <span className="text-[10px] font-semibold text-foreground">{src.value}</span>
                </div>
              ))}
            </div>
            
            {/* Trend Stats */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-primary/10">
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success font-medium">{challenge.trendGrowth}</span>
                <span className="text-muted-foreground">growth</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{challenge.audienceSize}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
            {challenge.description}
          </p>

          {/* Example Prompt */}
          <div className="bg-secondary/50 rounded-lg p-3 mb-4 border border-border/50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
              Example Build
            </p>
            <p className="text-xs sm:text-sm italic">"{challenge.example}"</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-3 w-3 text-primary" />
              </div>
              <span>{challenge.participants} joined</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3 w-3" />
              </div>
              <span>{challenge.soloParticipants} solo</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-3 w-3" />
              </div>
              <span>{challenge.teamCount} teams</span>
            </div>
          </div>

          {/* Time & Prize Distribution */}
          <div className="flex items-center justify-between text-xs mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={isActive ? "text-success font-medium" : "text-muted-foreground"}>
                {timeRemaining}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-warning" />
              <span className="text-muted-foreground">
                Winner takes <span className="text-success font-medium">${challenge.winnerPrize.toFixed(0)}</span>
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {challenge.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          {isActive ? (
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 bg-gradient-primary hover:opacity-90">
                  <Trophy className="h-4 w-4" />
                  Join Challenge - $1 Entry
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Join "{challenge.title}"
                  </DialogTitle>
                  <DialogDescription>
                    Choose how you want to compete. Entry fee: $1.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Join Type Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleJoin("solo")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        joinType === "solo"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold">Solo</p>
                      <p className="text-xs text-muted-foreground">Build alone</p>
                    </button>
                    <button
                      onClick={() => handleJoin("team")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        joinType === "team"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold">Team</p>
                      <p className="text-xs text-muted-foreground">Up to 4 members</p>
                    </button>
                  </div>

                  {/* Prize Info */}
                  <div className="bg-secondary rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Entry Fee</span>
                      <span className="font-medium">$1.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Pool</span>
                      <span className="font-medium text-success">${challenge.prizePool}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Winner Prize (90%)</span>
                      <span className="font-bold text-success">${challenge.winnerPrize.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-[10px] text-muted-foreground">
                        🤖 Winner selected by AI analysis: code quality, aesthetics, and creativity.
                      </p>
                    </div>
                  </div>

                  {/* Build Time */}
                  <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/30">
                    <Clock className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm font-medium">24 Hour Build Sprint</p>
                      <p className="text-xs text-muted-foreground">
                        Submit before time runs out to be eligible.
                      </p>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    className="w-full"
                    disabled={!joinType}
                    onClick={handleConfirmJoin}
                  >
                    {joinType
                      ? `Join as ${joinType === "solo" ? "Solo Builder" : "Team"} - Pay $1`
                      : "Select Solo or Team"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : isVoting ? (
            <Button variant="outline" className="w-full gap-2" disabled>
              <Vote className="h-4 w-4" />
              Voting in Progress
            </Button>
          ) : (
            <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              View Results
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
