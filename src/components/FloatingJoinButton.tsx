import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shield, User, Users, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useMyChallengeJoins, useJoinChallenge } from "@/hooks/useChallengeJoins";
import { PaywallModal } from "@/components/PaywallModal";
import { AuthModal } from "@/components/AuthModal";
import { BuilderVerificationModal } from "@/components/BuilderVerificationModal";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/lib/supabaseClient";
import { DailyChallenge } from "@/data/challengesData";

interface FloatingJoinButtonProps {
  challenge: DailyChallenge | null;
}

export const FloatingJoinButton = ({ challenge }: FloatingJoinButtonProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { hasPremiumAccess } = useSubscription();
  const { data: myChallengeJoins = [] } = useMyChallengeJoins();
  const joinChallengeMutation = useJoinChallenge();
  
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
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

  if (!challenge || challenge.status !== "active") return null;

  const existingJoin = myChallengeJoins.find(j => j.challenge_id === challenge.id);
  const hasJoined = !!existingJoin;

  // Don't show if already joined
  if (hasJoined) return null;

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsJoinDialogOpen(true);
    }
  };

  const handleJoin = (type: "solo" | "team") => {
    setJoinType(type);
  };

  const handleConfirmJoin = async () => {
    if (!joinType) return;
    setIsJoinDialogOpen(false);
    
    if (!isVerified) {
      setIsVerificationOpen(true);
    } else if (hasPremiumAccess) {
      handleFreeJoin();
    } else {
      setIsPaywallOpen(true);
    }
  };

  const handleVerificationComplete = () => {
    setIsVerified(true);
    setIsVerificationOpen(false);
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

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-40"
      >
        <Button
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="w-full md:w-auto font-mono shadow-lg"
          size="lg"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isVerified ? (
            <Shield className="h-4 w-4 mr-2 text-success" />
          ) : (
            <Trophy className="h-4 w-4 mr-2" />
          )}
          ./join — $5 entry
        </Button>
      </motion.div>

      {/* Join Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
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
              onClick={handleConfirmJoin}
              disabled={!joinType || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isVerified ? (
                <Shield className="h-4 w-4 mr-2 text-success" />
              ) : (
                <Trophy className="h-4 w-4 mr-2" />
              )}
              {hasPremiumAccess ? "./join (free)" : "./join — $5"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verification Modal */}
      <BuilderVerificationModal
        open={isVerificationOpen}
        onOpenChange={setIsVerificationOpen}
        onVerified={handleVerificationComplete}
      />

      {/* Paywall Modal */}
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

      {/* Auth Modal */}
      <AuthModal 
        open={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
      />
    </>
  );
};
