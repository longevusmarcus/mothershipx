import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import mothershipMascot from "@/assets/mothership-mascot.png";
import lovableLogo from "@/assets/lovable-logo.png";

// Floating particles around the mascot
function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
      style={{ left: `${50 + x}%`, top: `${50 + y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -20, -40],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeOut",
      }}
    />
  );
}

// Binary code rain effect
function BinaryRain({ column }: { column: number }) {
  return (
    <motion.div
      className="absolute font-mono text-[10px] text-primary/20 leading-tight whitespace-pre"
      style={{ left: `${column * 8}%` }}
      initial={{ y: -200 }}
      animate={{ y: "100vh" }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: "linear",
      }}
    >
      {Array.from({ length: 30 })
        .map(() => Math.round(Math.random()))
        .join("\n")}
    </motion.div>
  );
}

// Terminal-style intro text with typewriter
function TerminalIntro() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="font-mono text-xs sm:text-sm text-muted-foreground"
    >
      <motion.span
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-primary"
      >
        $
      </motion.span>{" "}
      <span className="text-foreground/70">introducing</span>{" "}
      <motion.span
        className="text-primary font-bold"
        animate={{
          textShadow: [
            "0 0 5px hsl(var(--primary) / 0.5)",
            "0 0 15px hsl(var(--primary) / 0.8)",
            "0 0 5px hsl(var(--primary) / 0.5)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ./mothership
      </motion.span>
    </motion.div>
  );
}

export function MeetMothershipSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="h-screen snap-start flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Binary rain background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        {Array.from({ length: 12 }).map((_, i) => (
          <BinaryRain key={i} column={i} />
        ))}
      </div>

      {/* Radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {isInView && (
        <div className="relative z-10 flex flex-col items-center">
          {/* Terminal intro */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <TerminalIntro />
          </motion.div>

          {/* Meet Mothership title */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-center mb-4"
          >
            <span className="text-muted-foreground">Meet</span>{" "}
            <motion.span
              className="text-foreground relative inline-block"
              animate={{
                textShadow: [
                  "0 0 20px hsl(var(--primary) / 0.3)",
                  "0 0 40px hsl(var(--primary) / 0.5)",
                  "0 0 20px hsl(var(--primary) / 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              MothershipX
            </motion.span>
          </motion.h2>

          {/* Subtitle - Think Lovable on steroids */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="font-mono text-sm sm:text-base text-muted-foreground">Think</span>
            <img 
              src={lovableLogo} 
              alt="Lovable" 
              className="h-5 sm:h-6 object-contain dark:invert-0 invert" 
            />
            <span className="font-mono text-sm sm:text-base text-muted-foreground">on</span>
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
              steroids
            </motion.span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-10 px-4 leading-relaxed"
          >
            We show what to build, lets hundreds of builders ship it in 1 click, and rewards the best results.
          </motion.p>

          {/* Mascot with floating animation */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
          >
            {/* Floating particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <FloatingParticle
                key={i}
                delay={i * 0.3}
                x={(Math.random() - 0.5) * 60}
                y={(Math.random() - 0.5) * 40}
              />
            ))}

            {/* Glow behind mascot */}
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1.4, 1.6, 1.4],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Secondary glow ring */}
            <motion.div
              className="absolute inset-[-20%] border border-primary/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Mascot image with hover effect */}
            <motion.div
              className="relative z-10"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 2, 0, -2, 0],
              }}
              transition={{
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              }}
              whileHover={{ scale: 1.1 }}
            >
              <motion.img
                src={mothershipMascot}
                alt="Mothership Mascot"
                className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 0 30px hsl(var(--primary) / 0.3))",
                }}
                animate={{
                  filter: [
                    "drop-shadow(0 0 30px hsl(var(--primary) / 0.3))",
                    "drop-shadow(0 0 50px hsl(var(--primary) / 0.5))",
                    "drop-shadow(0 0 30px hsl(var(--primary) / 0.3))",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Waving hand sparkle */}
              <motion.div
                className="absolute top-[25%] right-[15%] w-3 h-3"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              >
                <span className="text-primary text-lg">✦</span>
              </motion.div>
            </motion.div>
          </motion.div>


          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs text-muted-foreground font-mono">scroll</span>
              <div className="w-px h-6 bg-gradient-to-b from-muted-foreground to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
