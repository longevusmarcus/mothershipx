import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataScrapingSection } from "./DataScrapingSection";
import logoIcon from "@/assets/logo-icon.png";
import showcaseSignals from "@/assets/showcase-signals.png";
import showcaseDetail from "@/assets/showcase-detail.png";
import showcaseArena from "@/assets/showcase-arena.png";
import terminalAvatar from "@/assets/terminal-avatar.png";

// Terminal typing effect component
function TerminalTyping() {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const terminalText = `find 1,000 startup ideas from pain points on Reddit and TikTok, build and host landing pages, register domains, wire up Stripe, test in Chrome — zero mistakes allowed
--dangerously-skip-permissions --chrome`;

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < terminalText.length) {
        setDisplayedText(terminalText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="font-mono text-sm sm:text-base md:text-lg text-muted-foreground max-w-4xl mx-auto text-left bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
        <div className="w-3 h-3 rounded-full bg-destructive/70" />
        <div className="w-3 h-3 rounded-full bg-warning/70" />
        <div className="w-3 h-3 rounded-full bg-success/70" />
        <span className="ml-3 text-muted-foreground/50 text-xs font-mono">~/mothership</span>
      </div>
      <div className="flex items-start gap-3">
        {/* Avatar circle */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/50 shrink-0">
          <img src={terminalAvatar} alt="Builder" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-primary font-bold">$</span>
          </div>
          <div className="break-words whitespace-pre-wrap leading-relaxed">
            {displayedText}
            <span className={`${showCursor ? "opacity-100" : "opacity-0"} text-primary transition-opacity`}>▌</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    localStorage.setItem("mothershipx-visited", "true");
    navigate("/problems");
  };

  // Keyboard listener for Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="bg-background h-screen overflow-y-auto snap-y snap-mandatory">
      {/* PAGE 1: Terminal Only */}
      <section className="h-screen snap-start flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          {/* Trembling Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <motion.div
              animate={{
                x: [0, -1, 1, -1, 0],
                y: [0, 1, -1, 0, 1],
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 relative">
                <img src={logoIcon} alt="MothershipX" className="w-full h-full object-contain dark:invert-0 invert" />
              </div>
            </motion.div>
          </motion.div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <TerminalTyping />
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex justify-center mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-1 h-2 rounded-full bg-muted-foreground/50"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PAGE 2: Main Headline */}
      <section className="h-screen snap-start flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-foreground leading-[1.1]">
            Know what to build.
            <br />
            <span className="text-muted-foreground">Compete to ship it.</span>
            <br />
            Earn rewards from
            <br />
            <em className="font-accent">real outcomes.</em>
          </h1>
        </motion.div>
      </section>

      {/* PAGE 3: Data Scraping Visualization */}
      <DataScrapingSection />

      {/* PAGE 3: Tagline + Screenshots */}
      <section className="min-h-screen snap-start py-20 px-6 relative overflow-hidden flex flex-col justify-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Tagline with "speed of thought" emphasis */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <p className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-muted-foreground leading-relaxed">
              Build useful apps, websites, and digital products at the
            </p>

            {/* Speed of Thought - Matrix style highlight */}
            <div className="relative inline-block my-4">
              {/* Glitch layers */}
              <motion.span
                className="absolute inset-0 font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary/30"
                animate={{
                  x: [0, -2, 2, -1, 0],
                  opacity: [0.3, 0.5, 0.3, 0.4, 0.3],
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                style={{ clipPath: "inset(0 0 50% 0)" }}
              >
                speed of thought
              </motion.span>
              <motion.span
                className="absolute inset-0 font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary/20"
                animate={{
                  x: [0, 2, -2, 1, 0],
                  opacity: [0.2, 0.4, 0.2, 0.3, 0.2],
                }}
                transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.5 }}
                style={{ clipPath: "inset(50% 0 0 0)" }}
              >
                speed of thought
              </motion.span>

              {/* Main text */}
              <motion.span
                className="relative font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground"
                animate={{
                  textShadow: [
                    "0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)",
                    "0 0 30px hsl(var(--primary) / 0.7), 0 0 60px hsl(var(--primary) / 0.4)",
                    "0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                speed of thought
              </motion.span>

              {/* Scan line effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ mixBlendMode: "overlay" }}
              >
                <motion.div
                  className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                  animate={{ y: ["-100%", "3000%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                />
              </motion.div>
            </div>

            <p className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground leading-relaxed whitespace-nowrap">
              • backed by <em className="text-foreground font-accent">real market demand</em> and rewarded for{" "}
              <em className="text-foreground font-accent">real impact </em>•
            </p>
          </motion.div>

          {/* Screenshots with intense glow */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {/* Left screenshot */}
            <ScreenshotCard image={showcaseSignals} alt="Live Signals Dashboard" rotation={-6} delay={0} />

            {/* Center screenshot - larger */}
            <ScreenshotCard image={showcaseDetail} alt="Problem Analysis" rotation={0} delay={0.15} isCenter />

            {/* Right screenshot */}
            <ScreenshotCard image={showcaseArena} alt="Builder Arena" rotation={6} delay={0.3} />
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col items-center mt-16"
          >
            <Button
              onClick={handleEnter}
              size="lg"
              className="group text-base px-8 py-6 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Enter MothershipX
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="mt-4 text-xs text-muted-foreground/50 font-mono">Press Enter to begin →</p>
          </motion.div>

          {/* Footer - embedded in this section */}
          <div className="mt-20 pt-8 border-t border-border/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© 2026 MothershipX. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Screenshot card with glowing effect
function ScreenshotCard({
  image,
  alt,
  rotation,
  delay,
  isCenter = false,
}: {
  image: string;
  alt: string;
  rotation: number;
  delay: number;
  isCenter?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ rotate: 0, scale: 1.03, y: -10 }}
      className={`relative shrink-0 group ${
        isCenter
          ? "w-full max-w-[380px] sm:max-w-[440px] md:w-80 lg:w-96 z-10"
          : "w-full max-w-[320px] sm:max-w-[380px] md:w-64 lg:w-72"
      }`}
    >
      {/* Glow effect behind the image */}
      <div
        className={`absolute inset-0 rounded-2xl bg-primary/30 blur-2xl group-hover:blur-3xl transition-all duration-500 ${isCenter ? "scale-110" : "scale-105"} opacity-60 group-hover:opacity-80`}
      />

      {/* Secondary outer glow */}
      <div
        className={`absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl ${isCenter ? "opacity-50" : "opacity-30"}`}
      />

      <div className="relative rounded-xl overflow-hidden shadow-2xl border border-primary/20 group-hover:border-primary/40 transition-colors">
        <img src={image} alt={alt} className="block w-full h-auto" />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
