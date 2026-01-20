import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-icon.png";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
  challengeId: string;
  challengeTitle: string;
  joinType: "solo" | "team";
  prizePool: number;
  winnerPrize: number;
}

export function PaywallModal({
  open,
  onOpenChange,
  onPaymentSuccess,
  challengeId,
  challengeTitle,
  joinType,
  prizePool,
  winnerPrize,
}: PaywallModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsProcessing(false);
    }
  }, [open]);

  const handlePaymentClick = async () => {
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to continue");
        setIsProcessing(false);
        return;
      }

      const response = await supabase.functions.invoke("create-checkout", {
        body: {
          challengeId,
          joinType,
          successUrl: `${window.location.origin}/challenges?payment=success`,
          cancelUrl: `${window.location.origin}/challenges?payment=cancelled`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url } = response.data;
      
      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-border bg-card overflow-hidden">
        <div className="p-8">
          <AnimatePresence mode="wait">
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
                  Join "{challengeTitle}" as {joinType === "solo" ? "Solo" : "Team"}
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
                Secured by Stripe • Webhook verified
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
