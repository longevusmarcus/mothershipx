import { useState, useEffect, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ONBOARDING_COUNT_KEY = "problem_dashboard_onboarding_count";
const JOINED_GUIDE_KEY = "problem_joined_guide_dismissed";
const MAX_ONBOARDING_VIEWS = 3;

interface ProblemDashboardOnboardingProps {
  isJoined: boolean;
  justJoined: boolean;
  onDismiss?: () => void;
  startBuildingRef?: RefObject<HTMLButtonElement>;
  /** Wait for matrix effect to complete before showing onboarding */
  waitForMatrix?: boolean;
}

const TUTORIAL_STEPS = [
  {
    id: "overview",
    title: "Problem Dashboard",
    description: "Explore real pain points with AI-validated demand signals, market size, and competition analysis.",
    highlight: "header", // which area to highlight
  },
  {
    id: "ideas",
    title: "Ideas Tab",
    description: "AI-generated startup concepts tailored to this specific problem. Each idea includes a landing page preview.",
    highlight: "ideas-tab",
  },
  {
    id: "squads",
    title: "Squads",
    description: "Find collaborators and build together. Join existing teams or create your own squad.",
    highlight: "squads-tab",
  },
  {
    id: "launch",
    title: "Launch in Lovable",
    description: "One-click deployment. Ship your product instantly with AI-powered development.",
    highlight: "launch-button",
  },
  {
    id: "submit",
    title: "Submit Build",
    description: "Enter the arena and compete for prizes. Your submission gets scored on problem-solution fit.",
    highlight: "submit-button",
  },
];

export function ProblemDashboardOnboarding({
  isJoined,
  justJoined,
  onDismiss,
  startBuildingRef,
  waitForMatrix = false
}: ProblemDashboardOnboardingProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showJoinedGuide, setShowJoinedGuide] = useState(false);

  // Check if should show tutorial - first 3 visits
  useEffect(() => {
    if (waitForMatrix) return;
    
    const viewCount = parseInt(localStorage.getItem(ONBOARDING_COUNT_KEY) || "0", 10);
    
    if (viewCount < MAX_ONBOARDING_VIEWS && !isJoined) {
      setShowTutorial(true);
      setCurrentStep(0);
      localStorage.setItem(ONBOARDING_COUNT_KEY, String(viewCount + 1));
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
  };

  const dismissJoinedGuide = () => {
    setShowJoinedGuide(false);
    localStorage.setItem(JOINED_GUIDE_KEY, "true");
    onDismiss?.();
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <>
      {/* Multi-step tutorial overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] pointer-events-auto"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-background/85 backdrop-blur-sm"
              onClick={handleSkipAll}
            />
            
            {/* Tutorial card - bottom center */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[61]"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-muted">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {String(currentStep + 1).padStart(2, '0')}/{String(TUTORIAL_STEPS.length).padStart(2, '0')}
                      </span>
                      <h3 className="text-sm font-semibold tracking-tight">{step.title}</h3>
                    </div>
                    <button
                      onClick={handleSkipAll}
                      className="p-1 rounded-md hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                    {step.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleSkipAll}
                      className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      Skip all
                    </button>

                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="gap-1.5 h-8 px-4 text-xs"
                    >
                      {currentStep < TUTORIAL_STEPS.length - 1 ? (
                        <>
                          Next
                          <ChevronRight className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        "Got it"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {TUTORIAL_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    index === currentStep 
                      ? "w-4 bg-primary" 
                      : index < currentStep 
                        ? "w-1.5 bg-primary/50" 
                        : "w-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
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
