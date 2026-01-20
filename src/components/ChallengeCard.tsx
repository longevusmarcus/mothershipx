import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  Users,
  User,
  Zap,
  DollarSign,
  ChevronRight,
  Crown,
  Vote,
  CheckCircle2,
  TrendingUp,
  LogIn,
  Send,
} from "lucide-react";
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
import { getSourceIcon } from "@/data/marketIntelligence";
import { useAuth } from "@/contexts/AuthContext";
import { useMyChallengeJoins, useJoinChallenge } from "@/hooks/useChallengeJoins";
import { PaywallModal } from "@/components/PaywallModal";
import { AuthModal } from "@/components/AuthModal";

interface ChallengeCardProps {
  challenge: DailyChallenge;
  delay?: number;
}

export const ChallengeCard = ({ challenge, delay = 0 }: ChallengeCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: myChallengeJoins = [] } = useMyChallengeJoins();
  const joinChallengeMutation = useJoinChallenge();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [joinType, setJoinType] = useState<"solo" | "team" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const timeRemaining = getTimeRemaining(challenge.endsAt);
  const isActive = challenge.status === "active";
  const isVoting = challenge.status === "voting";
  const isCompleted = challenge.status === "completed";

  const existingJoin = myChallengeJoins.find(j => j.challenge_id === challenge.id);
  const hasJoined = !!existingJoin;

  const handleJoin = (type: "solo" | "team") => {
    setJoinType(type);
  };

  const handleConfirmJoin = async () => {
    if (!joinType) return;
    setIsJoinDialogOpen(false);
    setIsPaywallOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!joinType) return;
    setIsProcessing(true);
    
    try {
      await joinChallengeMutation.mutateAsync({
        challengeId: challenge.id,
        joinType,
      });
      
      toast.success(`Joined challenge as ${joinType}!`);
      setIsPaywallOpen(false);
      
      navigate("/submit", {
        state: {
          challenge: {
            id: challenge.id,
            title: challenge.title,
            trend: challenge.trend,
            description: challenge.description,
            example: challenge.example,
            prizePool: challenge.prizePool,
            winnerPrize: challenge.winnerPrize,
            endsAt: challenge.endsAt.toISOString(),
            difficulty: challenge.difficulty,
            tags: challenge.tags,
          },
          joinType,
          entryFee: 5,
        },
      });
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast.error("Failed to join challenge. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const statusLabel = isActive ? "Live" : isVoting ? "Voting" : "Completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="rounded-lg border border-border bg-card p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isActive && (
                <span className="flex items-center gap-1 text-xs text-success font-medium">
                  <Zap className="h-3 w-3" />
                  {statusLabel}
                </span>
              )}
              {isVoting && (
                <span className="flex items-center gap-1 text-xs text-warning font-medium">
                  <Vote className="h-3 w-3" />
                  {statusLabel}
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  {statusLabel}
                </span>
              )}
              <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
              {challenge.isToday && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                  TODAY
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base">{challenge.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trend: <span className="text-foreground">{challenge.trend}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-success font-semibold text-lg">
              <DollarSign className="h-4 w-4" />
              {challenge.prizePool}
            </div>
            <p className="text-[10px] text-muted-foreground">prize pool</p>
          </div>
        </div>

        {/* Why This Challenge */}
        <div className="bg-secondary/30 rounded-md p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Why this challenge?</p>
          <p className="text-sm">{challenge.whyRelevant}</p>
          
          {/* Sources */}
          <div className="flex flex-wrap gap-2 mt-3">
            {challenge.sources.map((src, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-xs bg-background rounded px-2 py-1"
              >
                <span>{getSourceIcon(src.source)}</span>
                <span className="text-muted-foreground">{src.metric}:</span>
                <span className="font-medium">{src.value}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/50 text-xs">
            <span className="flex items-center gap-1 text-success">
              <TrendingUp className="h-3 w-3" />
              {challenge.trendGrowth} growth
            </span>
            <span className="text-muted-foreground">{challenge.audienceSize}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>

        {/* Example */}
        <div className="bg-secondary/30 rounded-md p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Example build</p>
          <p className="text-sm italic">"{challenge.example}"</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {challenge.participants}/{challenge.maxParticipants} joined
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {challenge.soloParticipants} solo
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {challenge.teamCount} teams
          </span>
        </div>

        {/* Time & Prize */}
        <div className="flex items-center justify-between text-xs mb-4">
          <span className={`flex items-center gap-1 ${isActive ? "text-success" : "text-muted-foreground"}`}>
            <Clock className="h-3.5 w-3.5" />
            {timeRemaining}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Crown className="h-3.5 w-3.5 text-warning" />
            Winner takes <span className="text-success font-medium ml-1">${challenge.winnerPrize.toFixed(0)}</span>
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {challenge.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        {isActive ? (
          isAuthenticated ? (
            hasJoined ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Joined as {existingJoin?.join_type === "team" ? "Team" : "Solo"}
                </div>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/submit", {
                    state: {
                      challenge: {
                        id: challenge.id,
                        title: challenge.title,
                        trend: challenge.trend,
                        description: challenge.description,
                        example: challenge.example,
                        prizePool: challenge.prizePool,
                        winnerPrize: challenge.winnerPrize,
                        endsAt: challenge.endsAt.toISOString(),
                        difficulty: challenge.difficulty,
                        tags: challenge.tags,
                      },
                      joinType: existingJoin?.join_type || "solo",
                      entryFee: 5,
                    },
                  })}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Your Build
                </Button>
              </div>
            ) : (
              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                <Button className="w-full">
                    <Trophy className="h-4 w-4 mr-2" />
                    Join Challenge – $5 Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Join "{challenge.title}"</DialogTitle>
                    <DialogDescription>
                      Choose how you want to compete. Entry fee: $5
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleJoin("solo")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          joinType === "solo"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <User className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium text-sm">Solo</p>
                        <p className="text-xs text-muted-foreground">Build alone</p>
                      </button>
                      <button
                        onClick={() => handleJoin("team")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          joinType === "team"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Users className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium text-sm">Team</p>
                        <p className="text-xs text-muted-foreground">Up to 4 members</p>
                      </button>
                    </div>

                    <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry Fee</span>
                        <span>$5.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Pool</span>
                        <span className="text-success">${challenge.prizePool}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Winner Prize</span>
                        <span className="font-medium text-success">${challenge.winnerPrize.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg text-sm">
                      <Clock className="h-4 w-4 text-warning shrink-0" />
                      <span>24 hour build sprint</span>
                    </div>

                    <Button
                      className="w-full"
                      disabled={!joinType || isProcessing}
                      onClick={handleConfirmJoin}
                    >
                      {joinType ? `Continue as ${joinType === "solo" ? "Solo" : "Team"}` : "Select Solo or Team"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )
          ) : (
            <Button variant="outline" className="w-full" onClick={handleAuthClick}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign in to Join
            </Button>
          )
        ) : isVoting ? (
          <Button variant="outline" className="w-full" disabled>
            <Vote className="h-4 w-4 mr-2" />
            Voting in Progress
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={() => navigate(`/challenges/${challenge.id}/results`)}
          >
            View Results
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      <PaywallModal
        open={isPaywallOpen}
        onOpenChange={setIsPaywallOpen}
        onPaymentSuccess={handlePaymentSuccess}
        challengeId={challenge.id}
        challengeTitle={challenge.title}
        joinType={joinType || "solo"}
        prizePool={challenge.prizePool}
        winnerPrize={challenge.winnerPrize}
      />

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </motion.div>
  );
};