import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TerminalTyping } from "./TerminalTyping";
import { FeaturesSection, ShowcaseSection } from "./FeatureSections";
import { FadeInOnScroll } from "./ParallaxEffects";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";

const TERMINAL_COMMAND = `find 1,000 startup ideas from pain points on Reddit and TikTok, build and host landing pages, register domains, wire up Stripe, test in Chrome — zero mistakes allowed --dangerously-skip-permissions --chrome`;

export function LandingHero() {
  const [phase, setPhase] = useState<"typing" | "reveal">("typing");
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const handleTypingComplete = () => {
    setPhase("reveal");
  };

  const handleEnter = () => {
    localStorage.setItem("mothershipx-visited", "true");
    navigate("/problems");
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <div className="bg-background">
      {/* Hero Section - Full viewport height */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden sticky top-0"
      >
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

            {phase === "reveal" && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-10"
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
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                  <Button 
                    onClick={handleEnter}
                    size="lg"
                    className="group text-base px-8 py-6 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Enter MothershipX
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={scrollToContent}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    See how it works
                    <ChevronDown className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="pt-12"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <ChevronDown className="w-6 h-6 mx-auto text-muted-foreground/40" />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Spacer for sticky hero */}
      <div className="h-screen" />

      {/* Showcase Sections */}
      <ShowcaseSection
        subtitle="Step 1 · Discover"
        title="Find problems people are already paying to solve"
        features={[
          "Real-time signals from TikTok, Reddit, and YouTube",
          "AI-analyzed pain points with proven demand",
          "Competition gap analysis to find blue oceans",
          "Viral trend detection before saturation"
        ]}
        screenshotPlaceholder="[Signals Dashboard]"
      />

      <ShowcaseSection
        subtitle="Step 2 · Build"
        title="Ship solutions at the speed of thought"
        features={[
          "Generate landing pages with AI in seconds",
          "Wire up Stripe payments instantly",
          "Deploy to custom domains automatically",
          "Get expert prompts tailored to each problem"
        ]}
        screenshotPlaceholder="[Solution Builder]"
        reverse
      />

      <ShowcaseSection
        subtitle="Step 3 · Compete"
        title="Enter challenges and prove your product"
        features={[
          "Join timed hackathons with real prize pools",
          "AI-powered evaluation of problem-solution fit",
          "Real-time leaderboards and rankings",
          "Graduate to live markets with ongoing rewards"
        ]}
        screenshotPlaceholder="[Challenge Arena]"
      />

      {/* Features Grid */}
      <FeaturesSection />

      {/* Final CTA */}
      <section className="py-32 px-6">
        <FadeInOnScroll className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal">
            Ready to build something <em className="font-accent">real</em>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Stop guessing what to build. Start with demand. Ship with confidence. Earn from impact.
          </p>
          <Button 
            onClick={handleEnter}
            size="lg"
            className="group text-base px-8 py-6 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </FadeInOnScroll>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 MothershipX. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      {/* Keyboard listener for Enter */}
      <EnterKeyListener onEnter={handleEnter} enabled={phase === "reveal"} />
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
