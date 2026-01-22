import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Check, Zap, Globe, Swords, Users, Trophy, Sparkles } from "lucide-react";
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
  { icon: Zap, label: "Unlimited AI searches", delay: 0 },
  { icon: Globe, label: "Full problem dashboard access", delay: 0.1 },
  { icon: Swords, label: "Free Arena challenge entry", delay: 0.2 },
  { icon: Users, label: "Builder matching/Networking", delay: 0.3 },
  { icon: Trophy, label: "Weekly prizes", delay: 0.4 },
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
      <DialogContent className="sm:max-w-md p-0 gap-0 border-border bg-card overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-xl">
        <div className="relative h-full sm:h-auto flex flex-col">
          {/* Animated background gradient */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-primary/8 via-transparent to-transparent blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative p-6 sm:p-8 overflow-y-auto flex flex-col flex-1 justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key="subscription-paywall"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col"
              >
                {/* Logo with pulse animation */}
                <motion.div
                  className="flex justify-center mb-6 sm:mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                >
                  <motion.div
                    className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center shadow-lg shadow-primary/10"
                    animate={{
                      boxShadow: [
                        "0 10px 40px -10px hsl(var(--primary) / 0.2)",
                        "0 10px 60px -10px hsl(var(--primary) / 0.35)",
                        "0 10px 40px -10px hsl(var(--primary) / 0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src={logoIcon} alt="" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Title with staggered animation */}
                <motion.div
                  className="text-center mb-6 sm:mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <h2 className="text-xl sm:text-2xl font-display font-medium tracking-tight mb-2">
                    Unlock Premium Access
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to access {featureLabels[feature]} and more
                  </p>
                </motion.div>

                {/* Price with scale animation */}
                <motion.div
                  className="text-center mb-6 sm:mb-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                >
                  <div className="inline-flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-semibold tracking-tight">${SUBSCRIPTION_PRICE}</span>
                    <span className="text-muted-foreground ml-1.5 text-base">/month</span>
                  </div>
                </motion.div>

                {/* Features with staggered entrance */}
                <motion.div
                  className="border border-border/50 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 space-y-3 bg-secondary/30 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  {features.map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + item.delay, duration: 0.3 }}
                    >
                      <motion.div
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </motion.div>
                      <span className="text-sm sm:text-base flex-1">{item.label}</span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + item.delay, type: "spring", stiffness: 500 }}
                      >
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-success shrink-0" />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA with hover animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <Button
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                    className="w-full h-12 sm:h-14 text-base font-medium relative overflow-hidden group"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Subscribe Now
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <ArrowRight className="h-5 w-5" />
                          </motion.span>
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>

                {/* Footer text */}
                <motion.div
                  className="mt-6 sm:mt-8 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.4 }}
                >
                  <p className="text-center text-xs sm:text-sm text-muted-foreground">
                    Or pay $5 per Arena challenge (NO search & library access)
                  </p>
                  <p className="text-center text-xs text-muted-foreground/60">
                    Cancel anytime • Secured by Stripe
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
