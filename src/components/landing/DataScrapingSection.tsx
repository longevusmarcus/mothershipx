import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import logoIcon from "@/assets/logo-icon.png";

// Platform data - simplified
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

// Elegant floating particle
function FloatingParticle({ delay, angle, distance }: { delay: number; angle: number; distance: number }) {
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-primary/60"
      style={{
        left: '50%',
        top: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x: [x, 0],
        y: [y, 0],
        opacity: [0, 0.8, 0.6, 0],
        scale: [0, 1, 0.5, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
        ease: "easeInOut",
      }}
    />
  );
}

// Minimal platform node
function PlatformNode({ 
  platform, 
  angle, 
  radius,
  size = "normal" 
}: { 
  platform: typeof platforms[0]; 
  angle: number; 
  radius: number;
  size?: "small" | "normal";
}) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const nodeSize = size === "small" ? "w-9 h-9" : "w-11 h-11";
  const fontSize = size === "small" ? "text-[10px]" : "text-xs";
  const labelSize = size === "small" ? "text-[8px]" : "text-[10px]";

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1"
      style={{ 
        left: `calc(50% + ${x}px - ${size === "small" ? 18 : 22}px)`, 
        top: `calc(50% + ${y}px - ${size === "small" ? 18 : 22}px)` 
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: platform.delay + 0.5, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        className={`${nodeSize} rounded-xl bg-card/90 border border-border/40 flex items-center justify-center font-mono ${fontSize} font-medium text-foreground/80 backdrop-blur-md`}
        whileHover={{ 
          scale: 1.08, 
          borderColor: "hsl(var(--primary) / 0.5)",
          backgroundColor: "hsl(var(--card))",
        }}
        animate={{
          boxShadow: [
            "0 0 0 0 hsl(var(--primary) / 0)",
            "0 0 20px 0 hsl(var(--primary) / 0.15)",
            "0 0 0 0 hsl(var(--primary) / 0)",
          ],
        }}
        transition={{
          boxShadow: { duration: 3, repeat: Infinity, delay: platform.delay },
          default: { duration: 0.2 }
        }}
      >
        {platform.icon}
      </motion.div>

      <motion.span
        className={`${labelSize} text-muted-foreground/60 font-mono tracking-wide`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: platform.delay + 0.8 }}
      >
        {platform.name}
      </motion.span>
    </motion.div>
  );
}

// Elegant central core with concentric rings
function CentralCore({ size = "normal" }: { size?: "small" | "normal" }) {
  const coreSize = size === "small" ? 80 : 120;
  const logoSize = size === "small" ? "w-6 h-6" : "w-8 h-8";
  
  return (
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: coreSize, height: coreSize }}
    >
      {/* Outer orbit ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        style={{ width: coreSize * 2.8, height: coreSize * 2.8, left: -coreSize * 0.9, top: -coreSize * 0.9 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Middle orbit ring - dashed */}
      <motion.div
        className="absolute rounded-full border border-dashed border-primary/15"
        style={{ width: coreSize * 2.2, height: coreSize * 2.2, left: -coreSize * 0.6, top: -coreSize * 0.6 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner subtle ring */}
      <motion.div
        className="absolute rounded-full border border-primary/10"
        style={{ width: coreSize * 1.5, height: coreSize * 1.5, left: -coreSize * 0.25, top: -coreSize * 0.25 }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Core glow background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-xl"
        style={{ width: coreSize * 1.2, height: coreSize * 1.2, left: -coreSize * 0.1, top: -coreSize * 0.1 }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Main core circle */}
      <motion.div
        className="absolute inset-0 rounded-full bg-card/95 border border-primary/30 flex items-center justify-center backdrop-blur-sm overflow-hidden"
        animate={{
          boxShadow: [
            "0 0 30px 5px hsl(var(--primary) / 0.1), inset 0 0 20px 0 hsl(var(--primary) / 0.05)",
            "0 0 50px 10px hsl(var(--primary) / 0.2), inset 0 0 30px 0 hsl(var(--primary) / 0.1)",
            "0 0 30px 5px hsl(var(--primary) / 0.1), inset 0 0 20px 0 hsl(var(--primary) / 0.05)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <motion.img
          src={logoIcon}
          alt=""
          className={`${logoSize} object-contain dark:invert-0 invert`}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

// Sophisticated orbital visualization - centered and minimal
function OrbitalVisualization({ size = "normal" }: { size?: "small" | "normal" }) {
  const containerSize = size === "small" ? 300 : 400;
  const orbitRadius = size === "small" ? 110 : 150;
  
  return (
    <div 
      className="relative mx-auto"
      style={{ width: containerSize, height: containerSize }}
    >
      {/* Central core */}
      <CentralCore size={size} />
      
      {/* Platform nodes in orbit */}
      {platforms.map((platform, i) => {
        const angle = (i / platforms.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <PlatformNode 
            key={platform.id} 
            platform={platform} 
            angle={angle} 
            radius={orbitRadius}
            size={size}
          />
        );
      })}
      
      {/* Floating data particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.5}
          angle={(i / 8) * Math.PI * 2}
          distance={orbitRadius * 0.8}
        />
      ))}
    </div>
  );
}

// Pain point with elegant typewriter
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
      }, 40);
      return () => clearInterval(typingInterval);
    }, delay * 1000);

    return () => clearTimeout(startDelay);
  }, [text, delay]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <motion.span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${isTyping ? "bg-primary" : "bg-muted-foreground/30"}`}
        animate={isTyping ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.4, repeat: isTyping ? Infinity : 0 }}
      />
      <span className="font-mono text-xs text-muted-foreground/80">
        {displayedText}
        {(isTyping || displayedText.length === 0) && (
          <span className={`${showCursor ? "opacity-100" : "opacity-0"} text-primary ml-0.5`}>|</span>
        )}
      </span>
    </motion.div>
  );
}

// Minimal leaderboard
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
      className="bg-card/60 border border-border/30 rounded-2xl p-5 backdrop-blur-md w-full max-w-xs"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/20">
        <motion.span 
          className="text-primary text-sm"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ◆
        </motion.span>
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Live Rankings</span>
      </div>
      <div className="space-y-3">
        {builders.map((builder, i) => (
          <motion.div
            key={builder.rank}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className={`font-mono text-sm font-medium ${builder.rank === 1 ? "text-primary" : "text-muted-foreground/60"}`}>
                {builder.rank}
              </span>
              <span className="font-mono text-sm text-foreground/80">{builder.name}</span>
            </div>
            <span className="font-mono text-xs text-primary/80 tabular-nums">
              {builder.score.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Subtle background
function BackgroundEffects() {
  return (
    <>
      {/* Subtle radial gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.03) 0%, transparent 70%)',
        }}
      />
      
      {/* Very subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
    </>
  );
}

// Section labels
const sectionLabels = ["Platforms", "Insights", "Rankings"];

// Mobile layout with horizontal carousel
function MobileDataScrapingLayout() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const [activeSection, setActiveSection] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const scrollAccumulator = useRef(0);
  const touchStartY = useRef(0);

  const handleScroll = useCallback((deltaY: number) => {
    if (!isLocked) return;
    
    scrollAccumulator.current += deltaY;
    const threshold = 80;
    
    if (scrollAccumulator.current > threshold) {
      if (activeSection < 2) {
        setActiveSection(prev => prev + 1);
        scrollAccumulator.current = 0;
      } else {
        setIsLocked(false);
      }
    } else if (scrollAccumulator.current < -threshold) {
      if (activeSection > 0) {
        setActiveSection(prev => prev - 1);
        scrollAccumulator.current = 0;
      } else {
        setIsLocked(false);
      }
    }
  }, [activeSection, isLocked]);

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
      { threshold: [0.6] }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLocked) return;

    const handleWheel = (e: WheelEvent) => {
      if (isLocked) {
        e.preventDefault();
        handleScroll(e.deltaY);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isLocked, handleScroll]);

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

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isLocked, handleScroll]);

  const painPoints = [
    "users frustrated with...",
    "need a better way to...",
    "I wish there was...",
    "looking for solution to...",
  ];

  return (
    <section
      ref={sectionRef}
      className="h-screen snap-start flex flex-col items-center justify-center px-4 relative overflow-hidden"
    >
      <BackgroundEffects />

      {isInView && (
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <motion.button
                key={i}
                onClick={() => setActiveSection(i)}
                className="relative h-1 rounded-full overflow-hidden"
                animate={{ width: i === activeSection ? 32 : 8 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`h-full w-full rounded-full ${i === activeSection ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
              </motion.button>
            ))}
          </div>

          {/* Section title */}
          <AnimatePresence mode="wait">
            <motion.p
              key={activeSection}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="font-mono text-[10px] text-muted-foreground/60 tracking-widest uppercase mb-6"
            >
              {sectionLabels[activeSection]}
            </motion.p>
          </AnimatePresence>

          {/* Content carousel */}
          <div className="w-full min-h-[380px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="w-full flex flex-col items-center"
              >
                {activeSection === 0 && (
                  <OrbitalVisualization size="small" />
                )}

                {activeSection === 1 && (
                  <div className="flex flex-col items-center gap-6 px-4">
                    <div className="text-center">
                      <motion.p
                        className="font-mono text-3xl font-medium text-foreground"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        1,247
                      </motion.p>
                      <p className="font-mono text-[10px] text-muted-foreground/60 tracking-widest uppercase mt-1">
                        Pain Points Found
                      </p>
                    </div>

                    <div className="space-y-3 w-full max-w-[280px]">
                      {painPoints.map((text, i) => (
                        <PainPointItem key={i} text={text} delay={0.2 + i * 0.4} />
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 2 && (
                  <div className="flex flex-col items-center gap-4 w-full px-4">
                    <LeaderboardPreview />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation hint */}
          <motion.p
            className="font-mono text-[10px] text-muted-foreground/40 mt-4"
            animate={{ opacity: isLocked ? [0.3, 0.6, 0.3] : 0.3 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isLocked ? "scroll to navigate" : ""}
          </motion.p>
        </div>
      )}
    </section>
  );
}

// Desktop layout - centered and sophisticated
function DesktopDataScrapingLayout() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const painPoints = [
    "users frustrated with...",
    "need a better way to...",
    "I wish there was...",
    "looking for solution to...",
  ];

  return (
    <section
      ref={ref}
      className="h-screen snap-start flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      <BackgroundEffects />

      {isInView && (
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {/* Minimal header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.p
              className="font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase mb-3"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Data Extraction Protocol
            </motion.p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-tight">
              Real-time market intelligence
            </h2>
          </motion.div>

          {/* Three column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Left: Pain points */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col items-center lg:items-end order-2 lg:order-1"
            >
              <div className="space-y-4 w-full max-w-[280px]">
                <div className="text-center lg:text-right mb-6">
                  <motion.p
                    className="font-mono text-4xl font-medium text-foreground"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    1,247
                  </motion.p>
                  <p className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase mt-1">
                    Pain Points Extracted
                  </p>
                </div>
                
                {painPoints.map((text, i) => (
                  <PainPointItem key={i} text={text} delay={0.5 + i * 0.5} />
                ))}
              </div>
            </motion.div>

            {/* Center: Orbital visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center justify-center order-1 lg:order-2"
            >
              <OrbitalVisualization size="normal" />
            </motion.div>

            {/* Right: Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col items-center lg:items-start order-3"
            >
              <LeaderboardPreview />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex gap-6 mt-6"
              >
                <div className="text-center lg:text-left">
                  <p className="font-mono text-2xl font-medium text-foreground">847</p>
                  <p className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">Builders</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-mono text-2xl font-medium text-primary">$12K</p>
                  <p className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">Weekly</p>
                </div>
              </motion.div>
            </motion.div>
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
