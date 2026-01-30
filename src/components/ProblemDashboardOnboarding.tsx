import { useState, useEffect, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
const ONBOARDING_DISMISSED_KEY = "problem_dashboard_onboarding_dismissed";
const JOINED_GUIDE_KEY = "problem_joined_guide_dismissed";

interface ProblemDashboardOnboardingProps {
  isJoined: boolean;
  justJoined: boolean;
  onDismiss?: () => void;
  startBuildingRef?: RefObject<HTMLButtonElement>;
  waitForMatrix?: boolean;
}

const TUTORIAL_STEPS = [
  {
    id: "start-building",
    title: "Start Building",
    description: "Join this problem to unlock all features and start building your solution.",
    selector: "[data-tutorial='start-building']",
    position: "bottom" as const,
  },
  {
    id: "ideas",
    title: "Ideas",
    description: "AI-generated startup concepts tailored to this problem.",
    selector: "[data-tutorial='ideas-tab']",
    position: "bottom" as const,
  },
  {
    id: "squads",
    title: "Squads",
    description: "Find collaborators and build together as a team.",
    selector: "[data-tutorial='squads-tab']",
    position: "bottom" as const,
  },
  {
    id: "launch",
    title: "Launch with 1 click",
    description: "Ship your product instantly with AI-powered development.",
    selector: "[data-tutorial='launch-button']",
    position: "bottom" as const,
  },
  {
    id: "submit",
    title: "Submit Build",
    description: "Enter the arena and compete for prizes when you're ready.",
    selector: "[data-tutorial='submit-button']",
    position: "left" as const,
  },
];

export function ProblemDashboardOnboarding({
  isJoined,
  justJoined,
  onDismiss,
  startBuildingRef,
  waitForMatrix = false
}: ProblemDashboardOnboardingProps) {
  const { hasPremiumAccess } = useSubscription();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showJoinedGuide, setShowJoinedGuide] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];

  // Update target element position
  useEffect(() => {
    if (!showTutorial) return;

    const updatePosition = () => {
      const element = document.querySelector(step.selector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    
    // Small delay to ensure elements are rendered
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [showTutorial, currentStep, step.selector]);

  // Check if should show tutorial - only for subscribed users, only once
  useEffect(() => {
    if (waitForMatrix) return;
    // Only show tutorial for premium/subscribed users
    if (!hasPremiumAccess) return;

    const isDismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "true";

    if (!isDismissed && !isJoined) {
      // Small delay to let page render
      const timer = setTimeout(() => {
        setShowTutorial(true);
        setCurrentStep(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isJoined, waitForMatrix, hasPremiumAccess]);

  // Show guide after joining
  useEffect(() => {
    if (justJoined) {
      const hasSeenGuide = localStorage.getItem(JOINED_GUIDE_KEY);
      if (!hasSeenGuide) {
        setShowJoinedGuide(true);
      }
    }
  }, [justJoined]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkipAll();
    }
  };

  const handleSkipAll = () => {
    setShowTutorial(false);
    setCurrentStep(0);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
  };

  const dismissJoinedGuide = () => {
    setShowJoinedGuide(false);
    localStorage.setItem(JOINED_GUIDE_KEY, "true");
    onDismiss?.();
  };

  // Calculate tooltip position - mobile-aware
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    
    const padding = 16;
    const tooltipWidth = 256; // w-64 = 16rem = 256px
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 640;
    
    // On mobile, center the tooltip horizontally with safe margins
    if (isMobile) {
      const safeMargin = 16;
      return {
        top: targetRect.bottom + padding,
        left: safeMargin,
        right: safeMargin,
        transform: "none",
      };
    }
    
    if (step.position === "bottom") {
      // Clamp horizontal position to keep tooltip on screen
      const idealLeft = targetRect.left + targetRect.width / 2;
      const minLeft = tooltipWidth / 2 + padding;
      const maxLeft = viewportWidth - tooltipWidth / 2 - padding;
      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, idealLeft));
      
      return {
        top: targetRect.bottom + padding,
        left: clampedLeft,
        transform: "translateX(-50%)",
      };
    }
    
    if (step.position === "left") {
      return {
        top: targetRect.top + targetRect.height / 2,
        right: window.innerWidth - targetRect.left + padding,
        transform: "translateY(-50%)",
      };
    }
    
    return {
      top: targetRect.bottom + padding,
      left: targetRect.left + targetRect.width / 2,
      transform: "translateX(-50%)",
    };
  };

  return (
    <>
      {/* Multi-step tutorial with element highlighting */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
          >
            {/* Backdrop with cutout for highlighted element */}
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={handleSkipAll}
            />
            
            {/* Highlight ring around target element */}
            {targetRect && (
              <motion.div
                key={`highlight-${currentStep}`}
                className="fixed z-[62] pointer-events-none"
                style={{
                  top: targetRect.top - 6,
                  left: targetRect.left - 6,
                  width: targetRect.width + 12,
                  height: targetRect.height + 12,
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-full h-full rounded-lg border-2 border-primary bg-primary/10"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 hsl(var(--primary) / 0.3)",
                      "0 0 0 8px hsl(var(--primary) / 0)",
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            )}

            {/* Tooltip */}
            <motion.div
              key={`tooltip-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="fixed z-[63] pointer-events-auto"
              style={getTooltipStyle()}
            >
              <div className="bg-card border border-border rounded-lg shadow-xl p-4 w-full sm:w-64">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-primary">
                    {currentStep + 1}/{TUTORIAL_STEPS.length}
                  </span>
                  <div className="flex-1 flex gap-1">
                    {TUTORIAL_STEPS.map((_, index) => (
                      <div
                        key={index}
                        className={`h-0.5 flex-1 rounded-full transition-colors ${
                          index <= currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <h4 className="text-sm font-medium mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSkipAll}
                    className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    Skip all
                  </button>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="h-7 px-3 text-xs gap-1"
                  >
                    {currentStep < TUTORIAL_STEPS.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="h-3 w-3" />
                      </>
                    ) : (
                      "Done"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-join quick reference */}
      <AnimatePresence>
        {showJoinedGuide && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-sm"
          >
            <div 
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-2xl cursor-pointer"
              onClick={dismissJoinedGuide}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-primary">✓</span>
                </div>
                <span className="text-xs font-medium">You're in — start building!</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {["Ideas", "Squads", "Launch", "Submit"].map((item) => (
                  <span 
                    key={item}
                    className="px-2 py-1 bg-muted/60 rounded text-[10px] text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <p className="text-[9px] text-muted-foreground/40 text-center mt-3">
                tap to dismiss
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
