import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Sparkles,
  Shield,
  Clock,
  ChevronRight,
  Zap,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
  challengeTitle: string;
  prizePool: number;
  winnerPrize: number;
}

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/28E14g3ng0It5wD1gYgIo04";
const PAYMENT_VERIFICATION_DELAY = 10000; // 10 seconds

export function PaywallModal({
  open,
  onOpenChange,
  onPaymentSuccess,
  challengeTitle,
  prizePool,
  winnerPrize,
}: PaywallModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [paymentStarted, setPaymentStarted] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIsProcessing(false);
      setCountdown(null);
      setPaymentStarted(false);
    }
  }, [open]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Handle countdown completion
  useEffect(() => {
    if (countdown === 0 && paymentStarted) {
      onPaymentSuccess();
      onOpenChange(false);
    }
  }, [countdown, paymentStarted, onPaymentSuccess, onOpenChange]);

  const handlePaymentClick = useCallback(() => {
    setIsProcessing(true);
    setPaymentStarted(true);
    setCountdown(10);

    // Open Stripe payment link in new tab
    window.open(STRIPE_PAYMENT_LINK, "_blank", "noopener,noreferrer");
  }, []);

  const handleCancelPayment = useCallback(() => {
    // User came back before 10 seconds - assume payment didn't complete
    setIsProcessing(false);
    setPaymentStarted(false);
    setCountdown(null);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-transparent">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-gradient-to-b from-background via-background to-background/95 rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
        >
          {/* Premium glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative p-6 sm:p-8">
            <DialogHeader className="space-y-4 mb-6">
              {/* Icon badge */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Trophy className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-success flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-success-foreground" />
                  </div>
                </motion.div>
              </div>

              <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
                {paymentStarted ? "Verifying Payment..." : "Enter the Arena"}
              </DialogTitle>

              {!paymentStarted && (
                <p className="text-center text-sm text-muted-foreground max-w-xs mx-auto">
                  Join <span className="text-foreground font-medium">"{challengeTitle}"</span> and compete for the prize pool
                </p>
              )}
            </DialogHeader>

            <AnimatePresence mode="wait">
              {paymentStarted ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Processing indicator */}
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0"
                        >
                          <div className="h-full w-full rounded-full border-4 border-transparent border-t-primary" />
                        </motion.div>
                        <span className="text-2xl font-bold text-primary">{countdown}</span>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium">Complete your payment</p>
                      <p className="text-xs text-muted-foreground">
                        Waiting for confirmation from Stripe...
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span>Payment page opened in new tab</span>
                    </div>
                  </div>

                  {/* Cancel button */}
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleCancelPayment}
                  >
                    Cancel & Go Back
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="paywall"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-5"
                >
                  {/* Entry fee card */}
                  <div className="bg-gradient-to-br from-secondary/80 to-secondary rounded-xl p-5 border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Entry Fee</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">$2</span>
                        <span className="text-muted-foreground text-sm">.00</span>
                      </div>
                    </div>

                    <div className="h-px bg-border/50 my-3" />

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Prize Pool</span>
                        <span className="font-semibold text-success">${prizePool}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Winner Takes (90%)</span>
                        <span className="font-bold text-success">${winnerPrize.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2.5">
                    {[
                      { icon: Zap, text: "Instant challenge access" },
                      { icon: Shield, text: "Secure Stripe payment" },
                      { icon: Clock, text: "24h to submit your build" },
                    ].map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pay button */}
                  <Button
                    size="lg"
                    className="w-full gap-2 h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                    onClick={handlePaymentClick}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Pay $2 & Enter
                        <ChevronRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Stripe Powered</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
