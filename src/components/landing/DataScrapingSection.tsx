import { useRef } from "react";
import { motion, useInView } from "framer-motion";

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
  { id: "discord", name: "Discord", icon: "◆", delay: 0.8 },
  { id: "quora", name: "Quora", icon: "Q", delay: 0.9 },
  { id: "medium", name: "Medium", icon: "M", delay: 1.0 },
  { id: "indiehackers", name: "IH", icon: "⚡", delay: 1.1 },
];

// Floating data particles
function DataParticle({ delay, startX, startY }: { delay: number; startX: number; startY: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-primary"
      initial={{ x: startX, y: startY, opacity: 0, scale: 0 }}
      animate={{
        x: [startX, 0],
        y: [startY, 0],
        opacity: [0, 1, 1, 0],
        scale: [0, 1.5, 1, 0],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
        ease: "easeInOut",
      }}
    />
  );
}

// Platform node with pulsing effect
function PlatformNode({ platform, angle, radius }: { platform: typeof platforms[0]; angle: number; radius: number }) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: platform.delay, duration: 0.5, ease: "backOut" }}
    >
      {/* Connection line to center */}
      <motion.div
        className="absolute h-px bg-gradient-to-r from-primary/50 to-transparent origin-left"
        style={{
          width: radius,
          left: x > 0 ? -radius : 0,
          transform: `rotate(${x > 0 ? 180 + (angle * 180) / Math.PI : (angle * 180) / Math.PI}deg)`,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: platform.delay + 0.3, duration: 0.8 }}
      />

      {/* Platform icon */}
      <motion.div
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-card border border-border/50 flex items-center justify-center font-mono text-sm font-bold text-foreground shadow-lg backdrop-blur-sm"
        whileHover={{ scale: 1.1, borderColor: "hsl(var(--primary))" }}
        animate={{
          boxShadow: [
            "0 0 0 0 hsl(var(--primary) / 0)",
            "0 0 20px 2px hsl(var(--primary) / 0.3)",
            "0 0 0 0 hsl(var(--primary) / 0)",
          ],
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity, delay: platform.delay },
        }}
      >
        {platform.icon}

        {/* Data flow indicator */}
        <motion.div
          className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: platform.delay * 0.5 }}
        />
      </motion.div>

      {/* Platform name */}
      <motion.span
        className="mt-2 text-[10px] sm:text-xs text-muted-foreground font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: platform.delay + 0.5 }}
      >
        {platform.name}
      </motion.span>
    </motion.div>
  );
}

// Central processing core
function ProcessingCore() {
  return (
    <motion.div className="relative w-32 h-32 sm:w-40 sm:h-40">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Middle pulsing ring */}
      <motion.div
        className="absolute inset-4 rounded-full border border-primary/50"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Inner core */}
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/60 flex items-center justify-center backdrop-blur-sm"
        animate={{
          boxShadow: [
            "0 0 30px 10px hsl(var(--primary) / 0.2)",
            "0 0 50px 20px hsl(var(--primary) / 0.4)",
            "0 0 30px 10px hsl(var(--primary) / 0.2)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <motion.span
          className="font-mono text-xl sm:text-2xl font-bold text-primary"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          AI
        </motion.span>
      </motion.div>

      {/* Scanning effect */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        style={{ mixBlendMode: "overlay" }}
      >
        <motion.div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/80 to-transparent"
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
}

// Pain point extraction visualization
function PainPointExtraction() {
  const painPoints = [
    "users frustrated with...",
    "need a better way to...",
    "I wish there was...",
    "looking for solution to...",
    "struggle with...",
  ];

  return (
    <div className="flex flex-col gap-2">
      {painPoints.map((text, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 + i * 0.3, duration: 0.5 }}
          className="relative"
        >
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm"
            animate={{
              borderColor: [
                "hsl(var(--border) / 0.5)",
                "hsl(var(--primary) / 0.5)",
                "hsl(var(--border) / 0.5)",
              ],
            }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-primary shrink-0"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
            />
            <span className="font-mono text-xs sm:text-sm text-muted-foreground truncate">{text}</span>
          </motion.div>
        </motion.div>
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
      transition={{ delay: 4, duration: 0.6 }}
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
            transition={{ delay: 4.2 + i * 0.15 }}
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

export function DataScrapingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="h-screen snap-start flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Matrix-style falling code background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute font-mono text-xs text-primary whitespace-pre leading-tight"
            style={{ left: `${i * 5}%` }}
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
              {'>'} INITIALIZING DATA EXTRACTION PROTOCOL...
            </motion.p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-foreground">
              Scraping <span className="text-primary font-mono">12+</span> platforms
            </h2>
            <p className="text-muted-foreground mt-2 font-mono text-sm">
              Real-time market intelligence extraction
            </p>
          </motion.div>

          {/* Main visualization grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Left: Platform nodes orbital display */}
            <div className="relative h-[300px] sm:h-[350px] flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full h-full max-w-[350px] mx-auto">
                {/* Center core */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <ProcessingCore />
                </div>

                {/* Orbital platform nodes */}
                {platforms.slice(0, 8).map((platform, i) => {
                  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                  const radius = 120;
                  return <PlatformNode key={platform.id} platform={platform} angle={angle} radius={radius} />;
                })}

                {/* Data particles flowing to center */}
                {Array.from({ length: 15 }).map((_, i) => (
                  <DataParticle
                    key={i}
                    delay={i * 0.3}
                    startX={(Math.random() - 0.5) * 300}
                    startY={(Math.random() - 0.5) * 300}
                  />
                ))}
              </div>
            </div>

            {/* Center: Pain points extraction */}
            <div className="flex flex-col items-center gap-6 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-center"
              >
                <p className="font-mono text-xs text-muted-foreground mb-1">EXTRACTED PAIN POINTS</p>
                <motion.p
                  className="font-mono text-2xl sm:text-3xl font-bold text-primary"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  1,247
                </motion.p>
              </motion.div>

              <PainPointExtraction />

              {/* One-click solution button */}
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
                  <span>Turn into solution</span>
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

              {/* Additional stats */}
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

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="text-center mt-8 sm:mt-12 font-mono text-xs text-muted-foreground/60"
          >
            ▼ SCROLL TO CONTINUE ▼
          </motion.p>
        </div>
      )}
    </section>
  );
}
