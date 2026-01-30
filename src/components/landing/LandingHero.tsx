import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataScrapingSection } from "./DataScrapingSection";
import { MeetMothershipSection } from "./MeetMothershipSection";
import { UnlockingSection } from "./UnlockingSection";
import { FloatingMascot } from "./FloatingMascot";
import { ActivationAnimation } from "./ActivationAnimation";

import logoIcon from "@/assets/logo-icon.png";
import showcaseSignals from "@/assets/showcase-signals.png";
import showcaseDetail from "@/assets/showcase-detail.png";
import showcaseArena from "@/assets/showcase-arena.png";
import terminalAvatar from "@/assets/terminal-avatar.png";

// Terminal typing effect component
function TerminalTyping() {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const terminalText = `find 1,000 startup ideas from top pain points and trends across posts on Reddit, TikTok, YouTube, whatever -- build and host landing pages, register domains, wire up Stripe, test in Chrome -- zero mistakes allowed -- dangerously-skip-permissions--chrome`;

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
  const speedOfThoughtRef = useRef<HTMLDivElement>(null);
  const [showActivation, setShowActivation] = useState(false);

  const handleEnter = () => {
    setShowActivation(true);
  };

  const handleActivationComplete = () => {
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
    <>
      {/* Activation Animation Overlay */}
      <AnimatePresence>
        {showActivation && <ActivationAnimation onComplete={handleActivationComplete} />}
      </AnimatePresence>

      <div ref={containerRef} className="bg-background h-screen overflow-y-auto snap-y snap-mandatory">
        {/* Floating Mascot that follows scroll */}
        <FloatingMascot containerRef={containerRef as React.RefObject<HTMLDivElement>} />
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

        {/* PAGE 2: Meet Mothership */}
        <MeetMothershipSection />

        {/* PAGE 3: Data Scraping Visualization */}
        <DataScrapingSection />

        {/* PAGE 4: Main Headline */}
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

        {/* PAGE 5: The Unlocking Stack */}
        <UnlockingSection />

        {/* PAGE 6: Tagline + Screenshots */}
        <section className="min-h-screen snap-start py-12 md:py-20 px-4 md:px-6 relative overflow-hidden flex flex-col justify-center">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto w-full">
            {/* Tagline - matching MeetMothershipSection style */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-10 md:mb-16"
            >
              {/* Hacker-style intro */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="font-mono text-xs sm:text-sm mb-6"
              >
                <motion.span
                  className="text-primary/80 tracking-widest"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {">"}
                </motion.span>
                <motion.span
                  className="text-muted-foreground/70 ml-1"
                  animate={{
                    textShadow: ["0 0 0px transparent", "0 0 8px hsl(var(--primary) / 0.3)", "0 0 0px transparent"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  the_future_of_building
                </motion.span>
              </motion.div>

              {/* Main headline */}
              <motion.h2
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-center mb-4"
              >
                <span className="text-muted-foreground">
                  Make money by shipping useful apps·websites·digital goods at the
                </span>
              </motion.h2>

              {/* Speed of Thought - hero emphasis like MothershipX */}
              <motion.div
                ref={speedOfThoughtRef}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mb-4"
              >
                <motion.span
                  className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-foreground"
                  animate={{
                    textShadow: [
                      "0 0 20px hsl(var(--primary) / 0.3)",
                      "0 0 40px hsl(var(--primary) / 0.5)",
                      "0 0 20px hsl(var(--primary) / 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  speed of thought
                </motion.span>
              </motion.div>

              {/* Subtitle line - like "Think Lovable on steroids" style */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 flex-wrap"
              >
                <span className="font-mono text-sm sm:text-base text-muted-foreground">backed by</span>
                <motion.span
                  className="font-mono text-sm sm:text-base font-bold text-primary"
                  animate={{
                    textShadow: [
                      "0 0 10px hsl(var(--primary) / 0.5)",
                      "0 0 20px hsl(var(--primary) / 0.8)",
                      "0 0 10px hsl(var(--primary) / 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  real market demand
                </motion.span>
                <span className="font-mono text-sm sm:text-base text-muted-foreground/50">·</span>
                <span className="font-mono text-sm sm:text-base text-muted-foreground">rewarded for</span>
                <motion.span
                  className="font-mono text-sm sm:text-base font-bold text-primary"
                  animate={{
                    textShadow: [
                      "0 0 10px hsl(var(--primary) / 0.5)",
                      "0 0 20px hsl(var(--primary) / 0.8)",
                      "0 0 10px hsl(var(--primary) / 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  real impact
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Screenshots - Carousel on mobile, side-by-side on desktop */}
            <ScreenshotCarousel
              images={[
                { src: showcaseSignals, alt: "Live Signals Dashboard" },
                { src: showcaseDetail, alt: "Problem Analysis" },
                { src: showcaseArena, alt: "Builder Arena" },
              ]}
            />

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
                Enter MothershipX (Beta)
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="mt-4 text-xs text-muted-foreground/50 font-mono">Press Enter to begin</p>
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
    </>
  );
}

// Screenshot carousel for mobile with rotation effect
function ScreenshotCarousel({ images }: { images: { src: string; alt: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Auto-rotate on mobile
  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, isMobile]);

  // Desktop layout - side by side
  if (!isMobile) {
    return (
      <div className="relative flex flex-row items-center justify-center gap-8">
        {images.map((img, i) => (
          <ScreenshotCard
            key={img.alt}
            image={img.src}
            alt={img.alt}
            rotation={i === 0 ? -6 : i === 2 ? 6 : 0}
            delay={i * 0.15}
            isCenter={i === 1}
          />
        ))}
      </div>
    );
  }

  // Mobile layout - 3D rotating carousel
  return (
    <div className="relative w-full h-[280px] perspective-[1000px]">
      <div className="relative w-full h-full flex items-center justify-center">
        {images.map((img, i) => {
          const offset = i - activeIndex;
          const normalizedOffset = ((offset % images.length) + images.length) % images.length;
          const adjustedOffset =
            normalizedOffset > images.length / 2 ? normalizedOffset - images.length : normalizedOffset;

          return (
            <motion.div
              key={img.alt}
              className="absolute w-[85%] max-w-[320px]"
              initial={false}
              animate={{
                rotateY: adjustedOffset * 45,
                x: adjustedOffset * 60,
                z: adjustedOffset === 0 ? 0 : -150,
                opacity: Math.abs(adjustedOffset) > 1 ? 0 : 1 - Math.abs(adjustedOffset) * 0.4,
                scale: adjustedOffset === 0 ? 1 : 0.85,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => setActiveIndex(i)}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary/30 blur-2xl"
                animate={{ opacity: adjustedOffset === 0 ? 0.6 : 0.2 }}
              />

              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-primary/20">
                <img src={img.src} alt={img.alt} className="block w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <motion.button
            key={i}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: i === activeIndex ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
              scale: i === activeIndex ? 1.2 : 1,
            }}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

// Screenshot card with hover zoom overlay (for desktop)
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Normal card */}
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: rotation }}
        whileInView={{ opacity: 1, y: 0, rotate: rotation }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative shrink-0 group cursor-pointer ${isCenter ? "w-80 lg:w-96 z-10" : "w-64 lg:w-72"}`}
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

      {/* Fullscreen zoom overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
            style={{ backgroundColor: "hsl(var(--background) / 0.9)" }}
          >
            {/* Large image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-[90vw] max-w-5xl"
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-2xl" />

              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/30">
                <img src={image} alt={alt} className="block w-full h-auto" />
              </div>

              {/* Caption */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mt-4 font-mono text-sm text-muted-foreground"
              >
                {alt}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
