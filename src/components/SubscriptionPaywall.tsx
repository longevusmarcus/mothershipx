import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Check, Zap, Globe, Swords, Users, Trophy } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSubscription, SUBSCRIPTION_PRICE } from "@/hooks/useSubscription";
import { usePaywallAnalytics } from "@/hooks/usePaywallAnalytics";
import logoIcon from "@/assets/logo-icon.png";

interface SubscriptionPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: "search" | "problem" | "arena";
}

const features = [
  { icon: Zap, label: "Unlimited AI searches" },
  { icon: Globe, label: "Full problem dashboard access" },
  { icon: Swords, label: "Free Arena challenge entry" },
  { icon: Users, label: "Builder matching/Networking" },
  { icon: Trophy, label: "Weekly prizes" },
];

export function SubscriptionPaywall({ open, onOpenChange, feature = "search" }: SubscriptionPaywallProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createCheckout } = useSubscription();
  const { trackPaywallView, trackPaywallDismiss, trackCheckoutStart } = usePaywallAnalytics();

  // Track paywall view
  useEffect(() => {
    if (open) {
      trackPaywallView(feature);
    }
  }, [open, feature, trackPaywallView]);

  const featureLabels = {
    search: "AI-powered searches",
    problem: "problem dashboards",
    arena: "Arena challenges",
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && open) {
      // User is dismissing the paywall
      trackPaywallDismiss(feature);
    }
    onOpenChange(newOpen);
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    trackCheckoutStart(feature);

    try {
      const url = await createCheckout();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-border bg-card overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-lg">
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col h-full sm:h-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key="subscription-paywall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              {/* Logo */}
              <div className="flex justify-center mb-5 sm:mb-6">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <img src={logoIcon} alt="" className="h-6 w-6 sm:h-7 sm:w-7 object-contain" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-2">Unlock Premium Access</h2>
                <p className="text-sm text-muted-foreground">Subscribe to access {featureLabels[feature]} and more</p>
              </div>

              {/* Price */}
              <div className="text-center mb-5 sm:mb-6">
                <div className="inline-flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-semibold tracking-tight">${SUBSCRIPTION_PRICE}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </div>

              {/* Features */}
              <div className="border border-border rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 space-y-2.5 sm:space-y-3">
                {features.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <span className="text-sm flex-1">{item.label}</span>
                    <Check className="h-4 w-4 text-success shrink-0" />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button onClick={handleSubscribe} disabled={isProcessing} className="w-full h-11">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Alternative */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Or pay $5 per Arena challenge (NO search & library access)
              </p>

              {/* Trust */}
              <p className="text-center text-xs text-muted-foreground/70 mt-2">Cancel anytime • Secured by Stripe</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
