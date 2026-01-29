import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import logoIcon from "@/assets/logo-icon.png";

// Platform icons with their brand colors (using semantic tokens for theming)
const platforms = [
  { id: "tiktok", name: "TikTok", icon: "▶", delay: 0 },
  { id: "reddit", name: "Reddit", icon: "◉", delay: 0.1 },
  { id: "youtube", name: "YouTube", icon: "▷", delay: 0.2 },
  { id: "twitter", name: "X", icon: "✕", delay: 0.3 },
  { id: "hackernews", name: "HN", icon: "Y", delay: 0.4 },
  { id: "producthunt", name: "PH", icon: "P", delay: 0.5 },
  { id: "google", name: "Trends", icon: "G", delay: 0.6 },
  { id: "linkedin", name: "LinkedIn", icon: "in", delay: 0.7 },
];

// Minimal data particle - subtle and elegant
function DataParticle({ delay, startX, startY }: { delay: number; startX: number; startY: number }) {
  return (
    <motion.div
      className="absolute w-0.5 h-0.5 rounded-full bg-primary/60"
      initial={{ x: startX, y: startY, opacity: 0 }}
      animate={{
        x: [startX, 0],
        y: [startY, 0],
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
        ease: "easeInOut",
      }}
    />
  );
}

// Ultra-minimal platform node - senior designer aesthetic
function PlatformNode({ platform, angle, radius }: { platform: (typeof platforms)[0]; angle: number; radius: number }) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: platform.delay, duration: 0.8, ease: "easeOut" }}
    >
      {/* Minimal icon container - just text, no heavy card */}
      <motion.div
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted/40 flex items-center justify-center font-mono text-xs font-medium text-foreground/70"
        whileHover={{
          scale: 1.1,
          backgroundColor: "hsl(var(--muted) / 0.6)",
        }}
        transition={{ duration: 0.2 }}
      >
        {platform.icon}

        {/* Tiny pulse dot */}
        <motion.div
          className="absolute -right-px -top-px w-1 h-1 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: platform.delay }}
        />
      </motion.div>

      {/* Platform name - very subtle */}
      <span className="text-[9px] text-muted-foreground/50 font-mono tracking-wider uppercase">{platform.name}</span>
    </motion.div>
  );
}

// Orbit geometry (keep consistent across desktop + mobile variants)
const ORBIT = {
  desktop: { container: 320, ring: 260, radius: 130, particleField: 260 },
  mobile: { container: 280, ring: 220, radius: 110, particleField: 220 },
} as const;

// Sophisticated central processing core - minimal and elegant
function ProcessingCore({ size = "normal" }: { size?: "small" | "normal" }) {
  const containerSize = size === "small" ? 80 : 100;
  const sizeClasses = size === "small" ? "w-20 h-20" : "w-24 h-24 sm:w-28 sm:h-28";
  const logoSize = size === "small" ? "w-5 h-5" : "w-6 h-6 sm:w-7 sm:h-7";

  return (
    <motion.div className={`relative ${sizeClasses} flex items-center justify-center`}>
      {/* Outer orbit ring - subtle dashed */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: "1px dashed hsl(var(--muted-foreground) / 0.2)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Middle ring - solid, subtle */}
      <motion.div
        className="absolute rounded-full border border-border/50"
        style={{
          inset: size === "small" ? 8 : 10,
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner core - refined gradient */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-br from-card via-card to-muted/50 border border-border/60 flex items-center justify-center backdrop-blur-sm overflow-hidden shadow-lg"
        style={{
          inset: size === "small" ? 16 : 20,
        }}
        animate={{
          boxShadow: [
            "0 0 20px 5px hsl(var(--primary) / 0.1)",
            "0 0 30px 8px hsl(var(--primary) / 0.2)",
            "0 0 20px 5px hsl(var(--primary) / 0.1)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.img
          src={logoIcon}
          alt="Mothership"
          className={`${logoSize} object-contain dark:invert-0 invert opacity-80`}
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Subtle glow accent */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// Pain point extraction visualization with typewriter effect
function PainPointItem({ text, delay }: { text: string; delay: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startDelay = setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 50);
      return () => clearInterval(typingInterval);
    }, delay * 1000);

    return () => clearTimeout(startDelay);
  }, [text, delay]);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 400);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay, duration: 0.3 }}
      className="relative"
    >
      <motion.div
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm"
        animate={
          isTyping
            ? {
                borderColor: "hsl(var(--primary) / 0.7)",
                boxShadow: "0 0 10px 0 hsl(var(--primary) / 0.2)",
              }
            : {
                borderColor: "hsl(var(--border) / 0.5)",
                boxShadow: "0 0 0 0 transparent",
              }
        }
        transition={{ duration: 0.3 }}
      >
        <motion.span
          className={`w-2 h-2 rounded-full shrink-0 ${isTyping ? "bg-primary" : "bg-muted-foreground/50"}`}
          animate={isTyping ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
        />
        <span className="font-mono text-xs text-muted-foreground">
          {displayedText}
          {(isTyping || displayedText.length === 0) && (
            <span className={`${showCursor ? "opacity-100" : "opacity-0"} text-primary transition-opacity`}>▌</span>
          )}
        </span>
      </motion.div>
    </motion.div>
  );
}

function PainPointExtraction() {
  const painPoints = [
    "users frustrated with...",
    "need a better way to...",
    "I wish there was...",
    "looking for solution to...",
  ];

  return (
    <div className="flex flex-col gap-2">
      {painPoints.map((text, i) => (
        <PainPointItem key={i} text={text} delay={0.3 + i * 0.6} />
      ))}
    </div>
  );
}

// Leaderboard preview
function LeaderboardPreview() {
  const builders = [
    { rank: 1, name: "builder_x", score: 2847 },
    { rank: 2, name: "maker_pro", score: 2654 },
    { rank: 3, name: "ship_fast", score: 2501 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="bg-card/80 border border-border/50 rounded-xl p-4 backdrop-blur-sm w-full max-w-xs"
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
        <span className="text-primary">⚡</span>
        <span className="font-mono text-xs text-muted-foreground">LIVE LEADERBOARD</span>
      </div>
      <div className="space-y-2">
        {builders.map((builder, i) => (
          <motion.div
            key={builder.rank}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span className={`font-mono font-bold ${builder.rank === 1 ? "text-primary" : "text-muted-foreground"}`}>
                #{builder.rank}
              </span>
              <span className="font-mono text-foreground">{builder.name}</span>
            </div>
            <motion.span
              className="font-mono text-xs text-primary"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
            >
              {builder.score.toLocaleString()}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Background effects component
function BackgroundEffects() {
  return (
    <>
      {/* Matrix-style falling code background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute font-mono text-xs text-primary whitespace-pre leading-tight"
            style={{ left: `${i * 7}%` }}
            initial={{ y: -500 }}
            animate={{ y: "100vh" }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          >
            {Array.from({ length: 50 })
              .map(() => String.fromCharCode(33 + Math.random() * 93))
              .join("\n")}
          </motion.div>
        ))}
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />
    </>
  );
}

// Section labels for carousel
const sectionLabels = ["Platforms", "Pain Points", "Leaderboard"];

// Mobile carousel section content
function MobileCarouselContent({ activeSection }: { activeSection: number }) {
  return (
    <AnimatePresence mode="wait">
      {activeSection === 0 && (
        <motion.div
          key="platforms"
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.p
            className="font-mono text-[10px] text-primary/80 mb-4 tracking-wide"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {">"} SCANNING 12+ PLATFORMS...
          </motion.p>

          {/* Refined orbit display */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: ORBIT.mobile.container, height: ORBIT.mobile.container }}
          >
            {/* Orbit track - centered with platform nodes */}
            <motion.div
              className="absolute rounded-full border border-border/30"
              style={{
                left: "50%",
                top: "50%",
                width: ORBIT.mobile.ring,
                height: ORBIT.mobile.ring,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Core - centered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <ProcessingCore size="small" />
            </div>

            {/* Platform nodes */}
            {platforms.map((platform, i) => {
              const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
              return <PlatformNode key={platform.id} platform={platform} angle={angle} radius={ORBIT.mobile.radius} />;
            })}

            {/* Minimal particles */}
            {Array.from({ length: 6 }).map((_, i) => (
              <DataParticle
                key={i}
                delay={i * 0.4}
                startX={(Math.random() - 0.5) * ORBIT.mobile.particleField}
                startY={(Math.random() - 0.5) * ORBIT.mobile.particleField}
              />
            ))}
          </div>
        </motion.div>
      )}

      {activeSection === 1 && (
        <motion.div
          key="painpoints"
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center w-full px-4"
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
            <p className="font-mono text-xs text-muted-foreground mb-1">EXTRACTED PAIN POINTS</p>
            <motion.p
              className="font-mono text-3xl font-bold text-primary"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              247
            </motion.p>
          </motion.div>

          <PainPointExtraction />

          <motion.button
            className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-medium flex items-center gap-2"
            whileTap={{ scale: 0.98 }}
            animate={{
              boxShadow: [
                "0 0 15px 0 hsl(var(--primary) / 0.3)",
                "0 0 30px 5px hsl(var(--primary) / 0.5)",
                "0 0 15px 0 hsl(var(--primary) / 0.3)",
              ],
            }}
            transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
          >
            <span>→</span>
            <span>Turn into solution</span>
          </motion.button>
        </motion.div>
      )}

      {activeSection === 2 && (
        <motion.div
          key="leaderboard"
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-5 w-full px-4"
        >
          <LeaderboardPreview />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3 w-full max-w-xs"
          >
            <div className="bg-card/50 border border-border/30 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="font-mono text-xl font-bold text-foreground">847</p>
              <p className="font-mono text-[10px] text-muted-foreground">BUILDERS</p>
            </div>
            <div className="bg-card/50 border border-border/30 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="font-mono text-xl font-bold text-primary">$12K</p>
              <p className="font-mono text-[10px] text-muted-foreground">PRIZES</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mobile layout with scroll-linked horizontal carousel
function MobileDataScrapingLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const [activeSection, setActiveSection] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lastScrollY = useRef(0);
  const scrollAccumulator = useRef(0);
  const touchStartY = useRef(0);

  // Handle scroll/touch to advance sections horizontally
  const handleScroll = useCallback(
    (deltaY: number) => {
      if (!isLocked) return;

      scrollAccumulator.current += deltaY;

      // Threshold for changing section
      const threshold = 80;

      if (scrollAccumulator.current > threshold) {
        // Scroll down -> next section
        if (activeSection < 2) {
          setActiveSection((prev) => prev + 1);
          scrollAccumulator.current = 0;
        } else {
          // At last section, unlock and allow normal scroll
          setIsLocked(false);
        }
      } else if (scrollAccumulator.current < -threshold) {
        // Scroll up -> previous section
        if (activeSection > 0) {
          setActiveSection((prev) => prev - 1);
          scrollAccumulator.current = 0;
        } else {
          // At first section, unlock and allow normal scroll up
          setIsLocked(false);
        }
      }
    },
    [activeSection, isLocked],
  );

  // Lock scrolling when section comes into view at center
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setIsLocked(true);
            scrollAccumulator.current = 0;
          }
        });
      },
      { threshold: [0.6] },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Wheel event handler
  useEffect(() => {
    if (!isLocked) return;

    const handleWheel = (e: WheelEvent) => {
      if (isLocked) {
        e.preventDefault();
        handleScroll(e.deltaY);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isLocked, handleScroll]);

  // Touch event handlers for mobile
  useEffect(() => {
    if (!isLocked) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isLocked) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY;

      if (Math.abs(deltaY) > 10) {
        e.preventDefault();
        handleScroll(deltaY);
        touchStartY.current = currentY;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isLocked, handleScroll]);

  return (
    <section
      ref={sectionRef}
      className="h-screen snap-start flex flex-col items-center justify-center px-4 relative overflow-hidden"
    >
      <BackgroundEffects />

      {isInView && (
        <div
          ref={containerRef}
          className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center"
          style={{ perspective: "1000px" }}
        >
          {/* Title with dynamic text */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-4"
          >
            <AnimatePresence mode="wait">
              <motion.h2
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="font-display text-xl font-normal text-foreground"
              >
                {activeSection === 0 && (
                  <>
                    Scraping <span className="text-primary font-mono">12+</span> platforms
                  </>
                )}
                {activeSection === 1 && (
                  <>
                    Extracting <span className="text-primary font-mono">Pain Points</span>
                  </>
                )}
                {activeSection === 2 && (
                  <>
                    Showcasing <span className="text-primary font-mono">Arena</span>
                  </>
                )}
              </motion.h2>
            </AnimatePresence>

            {/* Status indicator */}
            <motion.p
              className="font-mono text-[10px] text-primary/70 mt-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isLocked ? "↕ SCROLL TO NAVIGATE" : "INITIALIZING..."}
            </motion.p>
          </motion.div>

          {/* Horizontal scroll indicator */}
          <div className="flex items-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="relative overflow-hidden"
                animate={{
                  width: i === activeSection ? 32 : 8,
                }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`h-1 rounded-full ${i === activeSection ? "bg-primary" : "bg-muted-foreground/30"}`}
                  style={{ width: "100%" }}
                />
                {i === activeSection && (
                  <motion.div
                    className="absolute inset-0 bg-primary/50 rounded-full"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Carousel content with horizontal slide animation */}
          <div className="w-full min-h-[380px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                {activeSection === 0 && (
                  <div className="flex flex-col items-center">
                    <motion.p
                      className="font-mono text-[10px] text-primary/80 mb-4 tracking-wide"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {">"} SCANNING PLATFORMS...
                    </motion.p>

                    {/* Refined mobile orbit */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{ width: ORBIT.mobile.container, height: ORBIT.mobile.container }}
                    >
                      {/* Orbit track - centered with platform nodes */}
                      <motion.div
                        className="absolute rounded-full border border-border/30"
                        style={{
                          left: "50%",
                          top: "50%",
                          width: ORBIT.mobile.ring,
                          height: ORBIT.mobile.ring,
                          transform: "translate(-50%, -50%)",
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                      />

                      {/* Core - centered */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <ProcessingCore size="small" />
                      </div>

                      {/* Platform nodes */}
                      {platforms.map((platform, i) => {
                        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                        return (
                          <PlatformNode
                            key={platform.id}
                            platform={platform}
                            angle={angle}
                            radius={ORBIT.mobile.radius}
                          />
                        );
                      })}

                      {/* Minimal particles */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <DataParticle
                          key={i}
                          delay={i * 0.4}
                          startX={(Math.random() - 0.5) * ORBIT.mobile.particleField}
                          startY={(Math.random() - 0.5) * ORBIT.mobile.particleField}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 1 && (
                  <div className="flex flex-col items-center w-full px-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
                      <p className="font-mono text-xs text-muted-foreground mb-1">PAIN POINTS AFFECTING 100K+ PEOPLE</p>
                      <motion.p
                        className="font-mono text-3xl font-bold text-primary"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        247
                      </motion.p>
                    </motion.div>

                    <PainPointExtraction />

                    <motion.button
                      className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-medium flex items-center gap-2"
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        boxShadow: [
                          "0 0 15px 0 hsl(var(--primary) / 0.3)",
                          "0 0 30px 5px hsl(var(--primary) / 0.5)",
                          "0 0 15px 0 hsl(var(--primary) / 0.3)",
                        ],
                      }}
                      transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                    >
                      <span>→</span>
                      <span>Turn into solutions</span>
                    </motion.button>
                  </div>
                )}

                {activeSection === 2 && (
                  <div className="flex flex-col items-center gap-5 w-full px-4">
                    <LeaderboardPreview />

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-2 gap-3 w-full max-w-xs"
                    >
                      <div className="bg-card/50 border border-border/30 rounded-lg p-3 text-center backdrop-blur-sm">
                        <p className="font-mono text-xl font-bold text-foreground">847</p>
                        <p className="font-mono text-[10px] text-muted-foreground">BUILDERS</p>
                      </div>
                      <div className="bg-card/50 border border-border/30 rounded-lg p-3 text-center backdrop-blur-sm">
                        <p className="font-mono text-xl font-bold text-primary">$12K</p>
                        <p className="font-mono text-[10px] text-muted-foreground">PRIZES</p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Section labels */}
          <div className="flex items-center gap-4 mt-4">
            {sectionLabels.map((label, i) => (
              <button
                key={label}
                onClick={() => setActiveSection(i)}
                className={`font-mono text-xs transition-all ${
                  i === activeSection
                    ? "text-primary scale-110"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Desktop layout (original)
function DesktopDataScrapingLayout() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="h-screen snap-start flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      <BackgroundEffects />

      {isInView && (
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.p
              className="font-mono text-xs sm:text-sm text-primary mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {">"} ACTIVATING DATA EXTRACTION PROTOCOL...
            </motion.p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-foreground">
              Scraping <span className="text-primary font-mono">12+</span> platforms
            </h2>
            <p className="text-muted-foreground mt-2 font-mono text-sm">
              Real-time market intelligence x mass-builder agent x hackathon arena
            </p>
          </motion.div>

          {/* Main visualization grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Left: Platform nodes orbital display - centered and refined */}
            <motion.div
              className="relative h-[320px] sm:h-[360px] flex items-center justify-center order-2 lg:order-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Central orbit container */}
              <div className="relative" style={{ width: ORBIT.desktop.container, height: ORBIT.desktop.container }}>
                {/* Orbit track - exactly centered on the same origin as nodes + core */}
                <motion.div
                  className="absolute rounded-full border border-border/30"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: ORBIT.desktop.ring,
                    height: ORBIT.desktop.ring,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />

                {/* Processing core - perfectly centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <ProcessingCore />
                </div>

                {/* Platform nodes orbiting around center */}
                {platforms.map((platform, i) => {
                  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <PlatformNode key={platform.id} platform={platform} angle={angle} radius={ORBIT.desktop.radius} />
                  );
                })}

                {/* Subtle data particles */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <DataParticle
                    key={i}
                    delay={i * 0.4}
                    startX={(Math.random() - 0.5) * ORBIT.desktop.particleField}
                    startY={(Math.random() - 0.5) * ORBIT.desktop.particleField}
                  />
                ))}
              </div>
            </motion.div>

            {/* Center: Pain points extraction */}
            <div className="flex flex-col items-center gap-6 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-center"
              >
                <p className="font-mono text-xs text-muted-foreground mb-1">PAIN POINTS AFFECTING 100K+ PEOPLE</p>
                <motion.p
                  className="font-mono text-2xl sm:text-3xl font-bold text-primary"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  247
                </motion.p>
              </motion.div>

              <PainPointExtraction />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.5, duration: 0.5 }}
                className="mt-4"
              >
                <motion.button
                  className="group px-6 py-3 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-medium flex items-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: [
                      "0 0 20px 0 hsl(var(--primary) / 0.3)",
                      "0 0 40px 5px hsl(var(--primary) / 0.5)",
                      "0 0 20px 0 hsl(var(--primary) / 0.3)",
                    ],
                  }}
                  transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                >
                  <span>→</span>
                  <span>Turn into solutions</span>
                  <motion.span
                    className="text-primary-foreground/70"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    1-CLICK
                  </motion.span>
                </motion.button>
              </motion.div>
            </div>

            {/* Right: Leaderboard preview */}
            <div className="flex flex-col items-center gap-6 order-3">
              <LeaderboardPreview />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.5 }}
                className="grid grid-cols-2 gap-4 w-full max-w-xs"
              >
                <div className="bg-card/50 border border-border/30 rounded-lg p-3 text-center backdrop-blur-sm">
                  <p className="font-mono text-lg sm:text-xl font-bold text-foreground">847</p>
                  <p className="font-mono text-[10px] text-muted-foreground">ACTIVE BUILDERS</p>
                </div>
                <div className="bg-card/50 border border-border/30 rounded-lg p-3 text-center backdrop-blur-sm">
                  <p className="font-mono text-lg sm:text-xl font-bold text-primary">$12K</p>
                  <p className="font-mono text-[10px] text-muted-foreground">WEEKLY PRIZES</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function DataScrapingSection() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileDataScrapingLayout />;
  }

  return <DesktopDataScrapingLayout />;
}
