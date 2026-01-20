import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
  challengeTitle: string;
  prizePool: number;
  winnerPrize: number;
}

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9AQbMU7Dw2QBfbdcNA";

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

  useEffect(() => {
    if (!open) {
      setIsProcessing(false);
      setCountdown(null);
      setPaymentStarted(false);
    }
  }, [open]);

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
    window.open(STRIPE_PAYMENT_LINK, "_blank", "noopener,noreferrer");
  }, []);

  const handleCancelPayment = useCallback(() => {
    setIsProcessing(false);
    setPaymentStarted(false);
    setCountdown(null);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-border bg-card overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary transition-colors z-10"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {paymentStarted ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                {/* Countdown */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-border"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="text-foreground"
                      strokeDasharray={226}
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: 226 }}
                      transition={{ duration: 10, ease: "linear" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tabular-nums">
                    {countdown}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-1">
                  Complete payment in new tab
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Verifying with Stripe...
                </p>

                <button
                  onClick={handleCancelPayment}
                  className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="paywall"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <img src={logoIcon} alt="" className="h-6 w-6 object-contain" />
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold tracking-tight mb-2">
                    Enter the Arena
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Join "{challengeTitle}"
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-baseline">
                    <span className="text-4xl font-semibold tracking-tight">$5</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    One-time entry fee
                  </p>
                </div>

                {/* Prize info */}
                <div className="border border-border rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground">Prize Pool</span>
                    <span className="font-medium">${prizePool}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Winner Takes</span>
                    <span className="font-medium text-foreground">${winnerPrize.toFixed(0)}</span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  onClick={handlePaymentClick}
                  disabled={isProcessing}
                  className="w-full h-11"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Trust */}
                <p className="text-center text-xs text-muted-foreground/70 mt-4">
                  Secured by Stripe
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
