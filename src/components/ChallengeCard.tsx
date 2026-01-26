import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  Users,
  User,
  ChevronRight,
  Crown,
  Vote,
  CheckCircle2,
  TrendingUp,
  LogIn,
  Send,
  Shield,
} from "lucide-react";
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
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { AuthModal } from "@/components/AuthModal";
import { BuilderVerificationModal } from "@/components/BuilderVerificationModal";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/lib/supabaseClient";

interface ChallengeCardProps {
  challenge: DailyChallenge;
  delay?: number;
}

export const ChallengeCard = ({ challenge, delay = 0 }: ChallengeCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { hasPremiumAccess } = useSubscription();
  const { data: myChallengeJoins = [] } = useMyChallengeJoins();
  const joinChallengeMutation = useJoinChallenge();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isSubscriptionPaywallOpen, setIsSubscriptionPaywallOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [joinType, setJoinType] = useState<"solo" | "team" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check if user is already verified
  useEffect(() => {
    if (user?.id) {
      checkVerificationStatus();
    }
  }, [user?.id]);

  const checkVerificationStatus = async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from("builder_verifications")
      .select("verification_status")
      .eq("user_id", user.id)
      .maybeSingle();
    
    setIsVerified(data?.verification_status === "verified");
  };

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
    
    // Check if user is verified first
    if (!isVerified) {
      setIsVerificationOpen(true);
    } else if (hasPremiumAccess) {
      // Premium users get free entry - join directly
      handleFreeJoin();
    } else {
      // Non-premium users see paywall for $5 entry
      setIsPaywallOpen(true);
    }
  };

  const handleVerificationComplete = () => {
    setIsVerified(true);
    setIsVerificationOpen(false);
    // After verification, check premium status
    if (hasPremiumAccess) {
      handleFreeJoin();
    } else {
      setIsPaywallOpen(true);
    }
  };

  const handleFreeJoin = async () => {
    if (!joinType) return;
    setIsProcessing(true);
    
    try {
      await joinChallengeMutation.mutateAsync({
        challengeId: challenge.id,
        joinType,
      });
      
      toast.success(`Joined challenge as ${joinType}! (Premium benefit: Free entry)`);
      
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
          entryFee: 0,
        },
      });
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast.error("Failed to join challenge. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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
      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6">
        {/* Terminal Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs border border-border px-2 py-1 rounded">
              ./challenge
            </span>
            <div className="flex items-center gap-2 font-mono text-xs">
              {isActive && (
                <span className="flex items-center gap-1.5 text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live
                </span>
              )}
              {isVoting && (
                <span className="flex items-center gap-1.5 text-warning">
                  <Vote className="h-3 w-3" />
                  Voting
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </span>
              )}
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="flex items-center justify-end gap-1.5">
              <Crown className="h-4 w-4 text-warning" />
              <span className="text-success text-lg font-medium">${challenge.prizePool}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">prize pool</p>
          </div>
        </div>

        {/* Title Row */}
        <div className="mb-4 group/title">
          <div className="flex items-center gap-2 font-mono mb-1">
            <span className="text-muted-foreground">&gt;</span>
            <h3 className="font-medium text-base relative">
              <span className="group-hover/title:opacity-0 transition-opacity duration-200">
                {challenge.title}
              </span>
              <span className="absolute inset-0 opacity-0 group-hover/title:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                {challenge.title}
                <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle animate-typing-cursor" />
              </span>
            </h3>
            {challenge.isToday && (
              <span className="font-mono text-[10px] text-primary uppercase tracking-wider">
                today
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-muted-foreground pl-5">
            trend: <span className="text-foreground">{challenge.trend}</span>
            <span className="mx-2">•</span>
            <span className={`${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
          </p>
        </div>

        {/* Why This Challenge */}
        <div className="border border-border/50 rounded-md p-4 mb-4 bg-secondary/20">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Why this challenge?</p>
          <p className="text-sm">{challenge.whyRelevant}</p>
          
          {/* Sources */}
          <div className="flex flex-wrap gap-2 mt-4">
            {challenge.sources.map((src, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 font-mono text-xs bg-background/50 border border-border/30 rounded px-2.5 py-1"
              >
                <span>{getSourceIcon(src.source)}</span>
                <span className="text-muted-foreground">{src.metric}:</span>
                <span className="font-medium">{src.value}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-success">
              <TrendingUp className="h-3 w-3" />
              {challenge.trendGrowth} growth
            </span>
            <span className="text-muted-foreground">{challenge.audienceSize}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

        {/* Example */}
        <div className="border border-border/50 rounded-md p-4 mb-4 bg-secondary/20">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Example build</p>
          <p className="text-sm italic text-muted-foreground">"{challenge.example}"</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {challenge.participants}/{challenge.maxParticipants}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {challenge.soloParticipants} solo
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {challenge.teamCount} teams
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center font-mono text-xs mb-4 py-3 border-t border-b border-border/30">
          <span className={`flex items-center gap-1.5 ${isActive ? "text-success" : "text-muted-foreground"}`}>
            <Clock className="h-3.5 w-3.5" />
            {timeRemaining}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {challenge.tags.map((tag) => (
            <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-border/50 bg-secondary/30 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        {isActive ? (
          isAuthenticated ? (
            hasJoined ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-2 font-mono text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Joined as {existingJoin?.join_type === "team" ? "team" : "solo"}
                </div>
                <Button 
                  className="w-full font-mono"
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
                  ./submit-build
                </Button>
              </div>
            ) : (
              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full font-mono">
                    {isVerified ? (
                      <Shield className="h-4 w-4 mr-2 text-success" />
                    ) : (
                      <Trophy className="h-4 w-4 mr-2" />
                    )}
                    ./join – $5 entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-mono">&gt; {challenge.title}</DialogTitle>
                    <DialogDescription className="font-mono text-xs">
                      {isVerified 
                        ? "Verified builder — choose your mode."
                        : "Choose mode. Verification required first."}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleJoin("solo")}
                        className={`p-4 rounded-lg border transition-all font-mono ${
                          joinType === "solo"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <User className="h-5 w-5 mx-auto mb-2" />
                        <p className="font-medium text-sm">&gt; solo</p>
                        <p className="text-[10px] text-muted-foreground">Build alone</p>
                      </button>
                      <button
                        onClick={() => handleJoin("team")}
                        className={`p-4 rounded-lg border transition-all font-mono ${
                          joinType === "team"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Users className="h-5 w-5 mx-auto mb-2" />
                        <p className="font-medium text-sm">&gt; team</p>
                        <p className="text-[10px] text-muted-foreground">Up to 4 members</p>
                      </button>
                    </div>

                    <div className="border border-border rounded-lg p-4 space-y-2 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">entry_fee:</span>
                        <span>$5.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">current_pool:</span>
                        <span className="text-success">${challenge.prizePool}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">winner_prize:</span>
                        <span className="font-medium text-success">${challenge.winnerPrize.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-3 border border-border/50 rounded-lg font-mono text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium">48h sprint</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground pl-5">
                        Ship what you can. Progress counts.
                      </p>
                    </div>

                    <Button
                      className="w-full font-mono"
                      disabled={!joinType || isProcessing}
                      onClick={handleConfirmJoin}
                    >
                      {joinType ? `./continue --mode=${joinType}` : "Select mode"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )
          ) : (
            <Button variant="outline" className="w-full font-mono" onClick={handleAuthClick}>
              <LogIn className="h-4 w-4 mr-2" />
              ./sign-in
            </Button>
          )
        ) : isVoting ? (
          <Button variant="outline" className="w-full font-mono" disabled>
            <Vote className="h-4 w-4 mr-2" />
            ./voting-in-progress
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full font-mono text-muted-foreground"
            onClick={() => navigate(`/challenges/${challenge.id}/results`)}
          >
            ./view-results
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      <BuilderVerificationModal
        open={isVerificationOpen}
        onOpenChange={setIsVerificationOpen}
        onVerified={handleVerificationComplete}
      />

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

      <SubscriptionPaywall
        open={isSubscriptionPaywallOpen}
        onOpenChange={setIsSubscriptionPaywallOpen}
        feature="arena"
      />

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </motion.div>
  );
};