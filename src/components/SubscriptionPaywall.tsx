import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Check, Zap, Globe, Swords } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSubscription, SUBSCRIPTION_PRICE } from "@/hooks/useSubscription";
import logoIcon from "@/assets/logo-icon.png";

interface SubscriptionPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: "search" | "problem" | "arena";
}

const features = [
  { icon: Zap, label: "Unlimited AI searches" },
  { icon: Globe, label: "Full problem dashboard access" },
  { icon: Swords, label: "Free Arena challenges entry" },
];

export function SubscriptionPaywall({
  open,
  onOpenChange,
  feature = "search",
}: SubscriptionPaywallProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createCheckout } = useSubscription();

  const featureLabels = {
    search: "AI-powered search",
    problem: "problem dashboards",
    arena: "Arena challenges",
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-border bg-card overflow-hidden">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="subscription-paywall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <img src={logoIcon} alt="" className="h-7 w-7 object-contain" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold tracking-tight mb-2">
                  Unlock Premium Access
                </h2>
                <p className="text-sm text-muted-foreground">
                  Subscribe to access {featureLabels[feature]} and more
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="inline-flex items-baseline">
                  <span className="text-4xl font-semibold tracking-tight">${SUBSCRIPTION_PRICE}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </div>

              {/* Features */}
              <div className="border border-border rounded-xl p-4 mb-6 space-y-3">
                {features.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                    <Check className="h-4 w-4 text-success ml-auto" />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full h-11"
              >
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
                Or pay $5 per Arena challenge
              </p>

              {/* Trust */}
              <p className="text-center text-xs text-muted-foreground/70 mt-2">
                Cancel anytime • Secured by Stripe
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
