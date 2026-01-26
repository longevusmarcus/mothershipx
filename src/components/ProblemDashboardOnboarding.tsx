import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const ONBOARDING_KEY = "problem_dashboard_onboarding_seen";
const JOINED_GUIDE_KEY = "problem_joined_guide_dismissed";

interface ProblemDashboardOnboardingProps {
  isJoined: boolean;
  justJoined: boolean;
  onDismiss?: () => void;
}

export function ProblemDashboardOnboarding({ 
  isJoined, 
  justJoined,
  onDismiss 
}: ProblemDashboardOnboardingProps) {
  const [showInitialHighlight, setShowInitialHighlight] = useState(false);
  const [showJoinedGuide, setShowJoinedGuide] = useState(false);

  // Check if first-time visitor
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding && !isJoined) {
      setShowInitialHighlight(true);
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setShowInitialHighlight(false);
        localStorage.setItem(ONBOARDING_KEY, "true");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isJoined]);

  // Show guide after joining
  useEffect(() => {
    if (justJoined) {
      const hasSeenGuide = localStorage.getItem(JOINED_GUIDE_KEY);
      if (!hasSeenGuide) {
        setShowJoinedGuide(true);
      }
    }
  }, [justJoined]);

  const dismissJoinedGuide = () => {
    setShowJoinedGuide(false);
    localStorage.setItem(JOINED_GUIDE_KEY, "true");
    onDismiss?.();
  };

  const dismissInitialHighlight = () => {
    setShowInitialHighlight(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  return (
    <>
      {/* First-time visitor overlay - highlights Start Building and + button */}
      <AnimatePresence>
        {showInitialHighlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] pointer-events-auto"
            onClick={dismissInitialHighlight}
          >
            {/* Backdrop blur */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            
            {/* Floating instruction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center z-[101]"
            >
              <div className="bg-card border border-border rounded-lg px-6 py-4 shadow-lg max-w-xs">
                <Sparkles className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium mb-1">Ready to build?</p>
                <p className="text-xs text-muted-foreground">
                  Click <span className="font-semibold text-foreground">Start Building</span> to join, 
                  or <span className="font-semibold text-foreground">+</span> to submit your product
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-3">Click anywhere to dismiss</p>
              </div>
            </motion.div>

            {/* Highlight ring for Start Building button area */}
            <motion.div
              className="absolute z-[102] pointer-events-none"
              style={{ 
                top: "calc(35vh)", 
                left: "50%", 
                transform: "translateX(-50%)" 
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
              transition={{ 
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.3 }
              }}
            >
              <div className="px-4 py-2 rounded-lg border-2 border-primary bg-primary/10">
                <span className="text-sm font-medium text-primary">Start Building</span>
              </div>
            </motion.div>

            {/* Highlight ring for + button (bottom right) */}
            <motion.div
              className="fixed bottom-6 right-6 z-[102] pointer-events-none"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.1, 1], opacity: 1 }}
              transition={{ 
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                opacity: { duration: 0.3, delay: 0.2 }
              }}
            >
              <div className="h-16 w-16 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">+</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-join guidance toast */}
      <AnimatePresence>
        {showJoinedGuide && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 left-1/2 z-[100] w-[90%] max-w-sm"
          >
            <div 
              className="bg-card border border-border rounded-lg p-4 shadow-xl cursor-pointer"
              onClick={dismissJoinedGuide}
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">You're in! What's next?</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                      <span>Explore <span className="font-medium text-foreground">Ideas</span> tab for AI solutions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                      <span>Join a <span className="font-medium text-foreground">Squad</span> to collaborate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                      <span>Click <span className="font-medium text-foreground">+</span> when ready to submit</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center mt-3">Tap to dismiss</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
