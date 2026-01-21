import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaywallAnalytics } from "@/hooks/usePaywallAnalytics";
import logoIcon from "@/assets/logo-icon.png";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();
  const { trackCheckoutComplete } = usePaywallAnalytics();
  const [showContent, setShowContent] = useState(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    // Refresh subscription status
    checkSubscription();
    
    // Track checkout completion (only once)
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCheckoutComplete();
    }
    
    // Delay content reveal for smoother animation
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [checkSubscription, trackCheckoutComplete]);

  return (
    <AppLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              delay: 0.2 
            }}
            className="relative mx-auto mb-8"
          >
            {/* Outer ring animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute inset-0 h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-primary/5"
            />
            
            {/* Inner circle with logo */}
            <div className="relative h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.5
                }}
              >
                <img src={logoIcon} alt="" className="h-10 w-10 object-contain" />
              </motion.div>
            </div>

            {/* Checkmark badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.7
              }}
              className="absolute -bottom-1 -right-1 left-1/2 ml-4 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-background"
            >
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-3 mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome to Premium
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
              Your subscription is now active. You have full access to all premium features.
            </p>
          </motion.div>

          {/* Features unlocked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex flex-wrap justify-center gap-2">
              {["Unlimited searches", "Full dashboards", "Free Arena entry", "Builder matching", "Weekly prizes"].map((feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={showContent ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
                  className="px-3 py-1.5 text-xs sm:text-sm rounded-full bg-muted/50 border border-border/50 text-muted-foreground"
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="space-y-3"
          >
            <Button 
              onClick={() => navigate("/problems")} 
              className="w-full sm:w-auto px-8 h-11"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground/70">
              Manage your subscription anytime in Settings
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
