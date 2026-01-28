import { useState, useEffect, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const ONBOARDING_KEY = "problem_dashboard_onboarding_seen";
const JOINED_GUIDE_KEY = "problem_joined_guide_dismissed";

interface ProblemDashboardOnboardingProps {
  isJoined: boolean;
  justJoined: boolean;
  onDismiss?: () => void;
  startBuildingRef?: RefObject<HTMLButtonElement>;
  /** Wait for matrix effect to complete before showing onboarding */
  waitForMatrix?: boolean;
}

const NEXT_STEPS = [
  {
    label: "Ideas",
    description: "AI-generated solutions tailored to this problem",
  },
  {
    label: "Squads",
    description: "Find collaborators and build together",
  },
  {
    label: "Launch",
    description: "Ship your product with one click",
  },
  {
    label: "Submit",
    description: "Enter the arena when you're ready",
  },
];

export function ProblemDashboardOnboarding({
  isJoined,
  justJoined,
  onDismiss,
  startBuildingRef,
  waitForMatrix = false
}: ProblemDashboardOnboardingProps) {
  const [showInitialHighlight, setShowInitialHighlight] = useState(false);
  const [showJoinedGuide, setShowJoinedGuide] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  // Track the Start Building button position
  useEffect(() => {
    if (!showInitialHighlight || !startBuildingRef?.current) return;

    const updatePosition = () => {
      if (startBuildingRef.current) {
        setButtonRect(startBuildingRef.current.getBoundingClientRect());
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [showInitialHighlight, startBuildingRef]);

  // Check if first-time visitor - only show after matrix effect completes
  useEffect(() => {
    // If waiting for matrix, don't show yet
    if (waitForMatrix) return;
    
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
  }, [isJoined, waitForMatrix]);

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
      {/* NOTE: z-[60] so it appears below paywall (z-[100]) */}
      <AnimatePresence>
        {showInitialHighlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] pointer-events-auto"
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
              <div className="bg-card border border-border rounded-xl px-6 py-5 shadow-lg max-w-xs">
                <p className="text-base font-medium tracking-tight mb-1">Ready to build?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click <span className="font-medium text-foreground">Start Building</span> to join, 
                  or <span className="font-medium text-foreground">+</span> to submit your product
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-4">tap anywhere to dismiss</p>
              </div>
            </motion.div>

            {/* Highlight ring for Start Building button area */}
            {buttonRect && (
              <motion.div
                className="fixed z-[62] pointer-events-none"
                style={{
                  top: buttonRect.top - 4,
                  left: buttonRect.left - 4,
                  width: buttonRect.width + 8,
                  height: buttonRect.height + 8,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                transition={{
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.3 }
                }}
              >
                <div className="w-full h-full rounded-lg border-2 border-primary bg-primary/10" />
              </motion.div>
            )}

            {/* Highlight ring for + button (bottom right) */}
            <motion.div
              className="fixed bottom-6 right-6 z-[62] pointer-events-none"
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

      {/* Post-join guidance - ultra minimal design */}
      {/* NOTE: z-[60] so it appears below paywall */}
      <AnimatePresence>
        {showJoinedGuide && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md"
          >
            <div 
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-2xl cursor-pointer"
              onClick={dismissJoinedGuide}
            >
              {/* Header - clean typography */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium tracking-tight">You're in</span>
              </div>

              {/* Steps - horizontal pills on mobile, clean grid */}
              <div className="grid grid-cols-2 gap-2">
                {NEXT_STEPS.map((step, index) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                    className="group relative bg-muted/50 hover:bg-muted rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground/60">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug pl-5">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Dismiss hint */}
              <p className="text-[10px] text-muted-foreground/40 text-center mt-4 tracking-wide">
                tap to continue
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
