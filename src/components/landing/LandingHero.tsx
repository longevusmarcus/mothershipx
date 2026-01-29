import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";
import showcaseSignals from "@/assets/showcase-signals.png";
import showcaseDetail from "@/assets/showcase-detail.png";
import showcaseArena from "@/assets/showcase-arena.png";

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
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="font-mono text-xs sm:text-sm text-muted-foreground/80 max-w-3xl mx-auto text-left bg-card/50 border border-border/50 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/30">
        <div className="w-3 h-3 rounded-full bg-destructive/60" />
        <div className="w-3 h-3 rounded-full bg-warning/60" />
        <div className="w-3 h-3 rounded-full bg-success/60" />
        <span className="ml-2 text-muted-foreground/50 text-xs">~/mothership</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-primary shrink-0">$</span>
        <div className="break-words whitespace-pre-wrap">
          {displayedText}
          <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} text-primary transition-opacity`}>▌</span>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  
  // Scroll-based opacity for hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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
    <div ref={containerRef} className="bg-background">
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      >
        {/* Subtle dot grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Trembling Matrix Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mb-8"
          >
            <motion.div 
              className="relative"
              animate={{ 
                x: [0, -1, 1, -1, 0, 1, -1, 0],
                y: [0, 1, -1, 0, 1, -1, 1, 0],
              }}
              transition={{ 
                duration: 0.15,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 relative">
                <img 
                  src={logoIcon} 
                  alt="MothershipX" 
                  className="w-full h-full object-contain dark:invert-0 invert" 
                />
                {/* Glitch overlay effect */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ 
                    opacity: [0, 0.3, 0, 0.2, 0],
                    x: [0, 2, -2, 1, 0],
                  }}
                  transition={{ 
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <img 
                    src={logoIcon} 
                    alt="" 
                    className="w-full h-full object-contain dark:invert-0 invert opacity-50 mix-blend-screen" 
                    style={{ filter: "hue-rotate(90deg)" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Terminal typing effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-10"
          >
            <TerminalTyping />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight text-foreground leading-[1.1]"
          >
            Know what to build.
            <br />
            <span className="text-muted-foreground">Compete to ship it.</span>
            <br />
            Earn rewards from
            <br />
            <em className="font-accent">real outcomes.</em>
          </motion.h1>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2 mx-auto"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-1 h-2 rounded-full bg-muted-foreground/50"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Second Section - Tagline + Screenshots */}
      <section className="min-h-screen py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-20"
          >
            Build useful apps, websites, and digital products at the speed of thought—backed by real market demand and rewarded for <em className="text-foreground font-accent">real impact.</em>
          </motion.p>

          {/* Screenshots with tilt effect */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {/* Left screenshot - tilted left */}
            <ScreenshotCard 
              image={showcaseSignals}
              alt="Live Signals Dashboard"
              rotation={-6}
              delay={0}
            />

            {/* Center screenshot - straight, larger */}
            <ScreenshotCard 
              image={showcaseDetail}
              alt="Problem Analysis"
              rotation={0}
              delay={0.1}
              isCenter
            />

            {/* Right screenshot - tilted right */}
            <ScreenshotCard 
              image={showcaseArena}
              alt="Builder Arena"
              rotation={6}
              delay={0.2}
            />
          </div>

          {/* Subtle glow behind center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <Button 
            onClick={handleEnter}
            size="lg"
            className="group text-base px-8 py-6 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Enter MothershipX
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="mt-6 text-xs text-muted-foreground/50 font-mono">
            Press Enter to begin →
          </p>
        </motion.div>
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
    </div>
  );
}

// Screenshot card with hover effect
function ScreenshotCard({ 
  image, 
  alt, 
  rotation, 
  delay,
  isCenter = false 
}: { 
  image: string; 
  alt: string; 
  rotation: number;
  delay: number;
  isCenter?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ rotate: 0, scale: 1.02, y: -8 }}
      className={`relative shrink-0 ${
        isCenter 
          ? "w-full max-w-[380px] sm:max-w-[440px] md:w-80 lg:w-96 z-10" 
          : "w-full max-w-[320px] sm:max-w-[380px] md:w-64 lg:w-72"
      }`}
    >
      <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-background/50 border border-border/30">
        <img 
          src={image} 
          alt={alt} 
          className="block w-full h-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
