import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TerminalTyping } from "./TerminalTyping";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";

const TERMINAL_COMMAND = `find 1,000 startup ideas from pain points on Reddit and TikTok, build and host landing pages, register domains, wire up Stripe, test in Chrome — zero mistakes allowed --dangerously-skip-permissions --chrome`;

export function LandingHero() {
  const [phase, setPhase] = useState<"typing" | "reveal" | "complete">("typing");
  const navigate = useNavigate();

  const handleTypingComplete = () => {
    setPhase("reveal");
  };

  const handleEnter = () => {
    localStorage.setItem("mothershipx-visited", "true");
    navigate("/problems");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
      {/* Subtle background grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {phase === "typing" && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Terminal window */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 sm:p-8 shadow-lg">
                {/* Terminal header */}
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                  <span className="ml-4 text-xs text-muted-foreground font-mono">mothershipx — bash</span>
                </div>
                
                <TerminalTyping 
                  text={TERMINAL_COMMAND}
                  onComplete={handleTypingComplete}
                />
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-muted-foreground text-sm"
              >
                Initializing...
              </motion.p>
            </motion.div>
          )}

          {(phase === "reveal" || phase === "complete") && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-12"
            >
              {/* Logo mark */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center shadow-lg p-3">
                  <img src={logoIcon} alt="MothershipX" className="w-full h-full object-contain invert dark:invert-0" />
                </div>
              </motion.div>

              {/* Main headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-foreground leading-[1.1]">
                  Know what to build.
                  <br />
                  <span className="text-muted-foreground">Compete to ship it.</span>
                  <br />
                  Earn rewards from
                  <br />
                  <em className="font-accent">real outcomes.</em>
                </h1>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="font-display text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Build useful apps, websites, and digital products at the speed of thought—backed by real market demand and rewarded for real impact.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onAnimationComplete={() => setPhase("complete")}
                className="pt-4"
              >
                <Button 
                  onClick={handleEnter}
                  size="lg"
                  className="group text-base px-8 py-6 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Enter MothershipX
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              {/* Subtle footer hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="pt-8"
              >
                <p className="text-xs text-muted-foreground/50 font-mono">
                  Press Enter to begin →
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard listener for Enter */}
      <EnterKeyListener onEnter={handleEnter} enabled={phase === "complete"} />
    </div>
  );
}

function EnterKeyListener({ onEnter, enabled }: { onEnter: () => void; enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onEnter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEnter, enabled]);

  return null;
}
