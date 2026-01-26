import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GUIDE_SEEN_KEY = "arena-accordion-guide-seen";

interface ArenaOnboardingOverlayProps {
  onComplete: () => void;
  onStepChange?: (step: number) => void;
}

export function ArenaOnboardingOverlay({ onComplete, onStepChange }: ArenaOnboardingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(GUIDE_SEEN_KEY);
    
    if (!hasSeenGuide) {
      // Small delay before showing
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 600);

      return () => clearTimeout(showTimer);
    }
  }, []);

  // Notify parent of step changes
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(GUIDE_SEEN_KEY, "true");
    onComplete();
  };

  // Auto-advance steps
  useEffect(() => {
    if (!isVisible) return;

    const stepTimer = setTimeout(() => {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleDismiss();
      }
    }, 2000);

    return () => clearTimeout(stepTimer);
  }, [isVisible, step]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={handleDismiss}
      >
        {/* Subtle backdrop */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />

        {/* Minimal guide content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center px-6"
        >
          <div className="space-y-6">
            {/* Step indicators */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-primary" : "w-1 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-2"
              >
                {step === 0 && (
                  <>
                    <p className="font-mono text-sm text-muted-foreground tracking-wide">
                      Welcome to the Arena
                    </p>
                    <p className="font-mono text-xs text-muted-foreground/60">
                      Compete. Build. Win.
                    </p>
                  </>
                )}
                {step === 1 && (
                  <>
                    <p className="font-mono text-sm text-muted-foreground tracking-wide">
                      $5 entry → $1,000 prize pool
                    </p>
                    <p className="font-mono text-xs text-muted-foreground/60">
                      Winner takes 90%
                    </p>
                  </>
                )}
                {step === 2 && (
                  <>
                    <p className="font-mono text-sm text-muted-foreground tracking-wide">
                      This is a challenge
                    </p>
                    <p className="font-mono text-xs text-muted-foreground/60">
                      Review the brief, then join
                    </p>
                  </>
                )}
                {step === 3 && (
                  <>
                    <p className="font-mono text-sm text-muted-foreground tracking-wide">
                      Click Join to enter
                    </p>
                    <p className="font-mono text-xs text-muted-foreground/60">
                      $5 to compete for $900
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Skip hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="font-mono text-[10px] text-muted-foreground/40"
            >
              tap anywhere to skip
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
