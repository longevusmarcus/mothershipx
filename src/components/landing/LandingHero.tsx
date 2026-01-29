import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataScrapingSection } from "./DataScrapingSection";
import { MeetMothershipSection } from "./MeetMothershipSection";
import { FloatingMascot } from "./FloatingMascot";
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

      {/* PAGE 3: Meet Mothership */}
      <MeetMothershipSection />

      {/* PAGE 4: Data Scraping Visualization */}
      <DataScrapingSection />

      {/* PAGE 5: Tagline + Screenshots */}
      <section className="min-h-screen snap-start py-12 md:py-20 px-4 md:px-6 relative overflow-hidden flex flex-col justify-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Tagline with "speed of thought" emphasis - fixed for mobile */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-10 md:mb-16"
          >
            <p className="font-display text-lg sm:text-xl md:text-3xl lg:text-4xl text-muted-foreground leading-relaxed px-2">
              Build useful apps, websites, and digital products at the
            </p>

            {/* Speed of Thought - Matrix style highlight with CRT flicker */}
            <div className="relative inline-block my-3 md:my-4">
              {/* CRT flicker overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-20"
                animate={{
                  opacity: [1, 0.97, 1, 0.98, 1, 0.96, 1],
                }}
                transition={{
                  duration: 0.15,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2 + 1,
                  times: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1],
                }}
              />

              {/* Glitch layers */}
              <motion.span
                className="absolute inset-0 font-mono text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-primary/30 tracking-tight uppercase"
                animate={{
                  x: [0, -2, 2, -1, 0],
                  opacity: [0.3, 0.5, 0.3, 0.4, 0.3],
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                style={{ clipPath: "inset(0 0 50% 0)" }}
              >
                speed_of_thought
              </motion.span>
              <motion.span
                className="absolute inset-0 font-mono text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-primary/20 tracking-tight uppercase"
                animate={{
                  x: [0, 2, -2, 1, 0],
                  opacity: [0.2, 0.4, 0.2, 0.3, 0.2],
                }}
                transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.5 }}
                style={{ clipPath: "inset(50% 0 0 0)" }}
              >
                speed_of_thought
              </motion.span>

              {/* Main text with CRT flicker */}
              <motion.span
                className="relative font-mono text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight uppercase"
                animate={{
                  textShadow: [
                    "0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)",
                    "0 0 30px hsl(var(--primary) / 0.7), 0 0 60px hsl(var(--primary) / 0.4)",
                    "0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)",
                  ],
                  opacity: [1, 0.92, 1, 0.97, 1, 0.94, 1],
                }}
                transition={{
                  textShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.1, repeat: Infinity, repeatDelay: 0.5 },
                }}
              >
                speed_of_thought
              </motion.span>

              {/* Horizontal scan lines (CRT effect) */}
              <div
                className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 4px)",
                }}
              />

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

            <p className="font-display text-sm sm:text-lg md:text-2xl lg:text-3xl text-muted-foreground leading-relaxed px-2">
              backed by <em className="text-foreground font-accent">real market demand</em>
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> and </span>
              <span className="sm:hidden"> & </span>
              rewarded for <em className="text-foreground font-accent">real impact</em>
            </p>
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
              Enter MothershipX
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
  );
}

// Screenshot carousel for mobile with rotation effect
function ScreenshotCarousel({ images }: { images: { src: string; alt: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
          const adjustedOffset = normalizedOffset > images.length / 2 ? normalizedOffset - images.length : normalizedOffset;
          
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

// Screenshot card with glowing effect (for desktop)
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
          ? "w-80 lg:w-96 z-10"
          : "w-64 lg:w-72"
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
