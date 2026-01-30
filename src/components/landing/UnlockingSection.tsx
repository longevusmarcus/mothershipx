import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import lovableLogo from "@/assets/lovable-logo.png";
import higgsfieldLogo from "@/assets/higgsfield-logo.png";
import mascotUfo from "@/assets/mascot-ufo.png";

interface UnlockCardProps {
  logo: string;
  name: string;
  unlocks: string;
  delay: number;
  isHighlighted?: boolean;
}

function UnlockCard({ logo, name, unlocks, delay, isHighlighted }: UnlockCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        delay,
        duration: 0.8,
        type: "spring",
        stiffness: 100,
      }}
      className="flex flex-col items-center gap-3 relative"
    >
      {/* Glow ring for highlighted card */}
      {isHighlighted && (
        <motion.div
          className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Logo container - same size for all */}
      <motion.div
        className="relative z-10 w-16 h-16 md:w-20 md:h-20"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Logo - no container/border */}
        <motion.img
          src={logo}
          alt={name}
          className="w-full h-full object-contain"
          animate={
            isHighlighted
              ? {
                  filter: [
                    "drop-shadow(0 0 10px hsl(var(--primary) / 0.3))",
                    "drop-shadow(0 0 30px hsl(var(--primary) / 0.6))",
                    "drop-shadow(0 0 10px hsl(var(--primary) / 0.3))",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Brand name */}
      <motion.span
        className={`font-display text-lg md:text-xl ${isHighlighted ? "text-foreground font-semibold" : "text-muted-foreground"}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3 }}
      >
        {name}
      </motion.span>

      {/* Equals sign */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.4, type: "spring" }}
        className={`font-mono text-xl md:text-2xl ${isHighlighted ? "text-primary" : "text-muted-foreground/50"}`}
      >
        =
      </motion.div>

      {/* Unlocking text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.5, duration: 0.6 }}
        className="relative"
      >
        {isHighlighted && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <motion.span
          className={`relative font-mono text-sm md:text-base tracking-wider ${
            isHighlighted ? "text-primary font-bold" : "text-muted-foreground"
          }`}
          animate={
            isHighlighted
              ? {
                  textShadow: [
                    "0 0 10px hsl(var(--primary) / 0.5)",
                    "0 0 30px hsl(var(--primary) / 0.8)",
                    "0 0 10px hsl(var(--primary) / 0.5)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          {unlocks}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function AnimatedArrow({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center justify-center px-4 md:px-8"
    >
      <motion.div
        className="flex items-center gap-1"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Left arrows */}
        <motion.span
          className="text-primary/40 text-2xl md:text-3xl font-mono"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        >
          ←
        </motion.span>
        <motion.span
          className="text-primary/60 text-2xl md:text-3xl font-mono"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >
          ←
        </motion.span>

        {/* Center divider */}
        <motion.span
          className="text-primary text-2xl md:text-3xl font-mono mx-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ·
        </motion.span>

        {/* Right arrows */}
        <motion.span
          className="text-primary/60 text-2xl md:text-3xl font-mono"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >
          →
        </motion.span>
        <motion.span
          className="text-primary/40 text-2xl md:text-3xl font-mono"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        >
          →
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

export function UnlockingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="h-screen snap-start flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-muted/10" />

      {/* Animated grid lines */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "60px 60px"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating particles */}
      {isInView && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              initial={{
                x: `${Math.random() * 100}%`,
                y: "100%",
                opacity: 0,
              }}
              animate={{
                y: "-10%",
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div
            className="font-mono text-xs sm:text-sm mb-4 tracking-widest"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-primary">&gt;</span>
            <span className="text-muted-foreground/70 ml-1">evolution_of_creation</span>
          </motion.div>

          <motion.h2
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-foreground"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            The Mother Of All{" "}
            <motion.span
              className="text-primary"
              animate={{
                textShadow: [
                  "0 0 10px hsl(var(--primary) / 0.3)",
                  "0 0 30px hsl(var(--primary) / 0.6)",
                  "0 0 10px hsl(var(--primary) / 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Stacks
            </motion.span>
          </motion.h2>
        </motion.div>

        {/* Unlocking flow - Lovable → MothershipX → Higgsfield */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
          {/* Lovable */}
          <UnlockCard logo={lovableLogo} name="Lovable" unlocks="Unlocking Creativity" delay={0.2} />

          <AnimatedArrow delay={0.6} />

          {/* MothershipX - in the middle, highlighted */}
          <UnlockCard
            logo={mascotUfo}
            name="MothershipX"
            unlocks="Unlocking Utility + Viability"
            delay={0.8}
            isHighlighted
          />

          <AnimatedArrow delay={1.2} />

          {/* Higgsfield */}
          <UnlockCard logo={higgsfieldLogo} name="Higgsfield" unlocks="Unlocking Virality" delay={1.4} />
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 2, duration: 0.8 }}
          className="text-center mt-16 md:mt-20"
        >
          <motion.p
            className="font-mono text-sm md:text-base text-muted-foreground/70"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Create ←→ <span className="text-primary font-bold">Ship with Purpose</span> ←→ Spread
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
