import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";

const WELCOME_SHOWN_KEY = "mothershipx_welcome_shown";

const WELCOME_STEPS = [
  "Welcome to MothershipX, a social market intelligence platform and hackathon arena empowering builders to ship useful products and win prizes every day.",
  "Mothership (SuperLovable) = insight + people + incentives\nLovable = execution.\n\nWe supercharge your Lovable experience so you know what to build, with who and get rewarded every day."
];

export function WelcomeChatbot() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    setWelcomeStep(0);
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
  };

  const handleNextStep = () => {
    if (welcomeStep < WELCOME_STEPS.length - 1) {
      setWelcomeStep(welcomeStep + 1);
    } else {
      handleDismissWelcome();
    }
  };

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="relative bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleDismissWelcome}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary/80 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            
            {/* Message content */}
            <div className="p-5 pr-10">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={logoIcon} alt="MothershipX" className="h-5 w-5 object-contain" />
                </div>
                <div className="flex-1">
                  <motion.p
                    key={welcomeStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm leading-relaxed text-foreground whitespace-pre-line"
                  >
                    {WELCOME_STEPS[welcomeStep]}
                  </motion.p>
                </div>
              </div>
            </div>
            
            {/* Step indicator and continue button */}
            <div className="px-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {WELCOME_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200",
                      index === welcomeStep 
                        ? "w-4 bg-foreground/70" 
                        : "w-1.5 bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={handleNextStep}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {welcomeStep < WELCOME_STEPS.length - 1 ? "Continue" : "Got it"}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            {/* Subtle bottom accent */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}