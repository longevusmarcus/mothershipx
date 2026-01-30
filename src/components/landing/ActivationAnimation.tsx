import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import mothershipMascot from "@/assets/mothership-mascot.png";
import mothershipPlanet from "@/assets/mothership-planet.png";

interface ActivationAnimationProps {
  onComplete: () => void;
}

export function ActivationAnimation({ onComplete }: ActivationAnimationProps) {
  const [phase, setPhase] = useState<"flying" | "landing" | "complete">("flying");

  useEffect(() => {
    // Phase 1: Flying animation (3 seconds)
    const landingTimer = setTimeout(() => {
      setPhase("landing");
    }, 2500);

    // Phase 2: Landing complete, transition out (4 seconds total)
    const completeTimer = setTimeout(() => {
      setPhase("complete");
    }, 4000);

    // Navigate after animation
    const navigateTimer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(landingTimer);
      clearTimeout(completeTimer);
      clearTimeout(navigateTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "complete" ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-foreground/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 1 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Speed lines during flight */}
      {phase === "flying" && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: 0,
                right: 0,
              }}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: "-100%", opacity: [0, 1, 0] }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Planet - appears on the right and grows */}
      <motion.div
        className="absolute"
        initial={{ 
          x: "60vw", 
          y: "10vh",
          scale: 0.3,
          opacity: 0 
        }}
        animate={{ 
          x: phase === "landing" ? "15vw" : "40vw",
          y: phase === "landing" ? "0vh" : "5vh",
          scale: phase === "landing" ? 1.2 : 0.6,
          opacity: 1,
        }}
        transition={{ 
          duration: phase === "landing" ? 1 : 2,
          ease: "easeOut" 
        }}
      >
        <motion.img
          src={mothershipPlanet}
          alt="Planet"
          className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 object-contain"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            filter: "drop-shadow(0 0 30px hsl(var(--primary) / 0.3))",
          }}
        />
      </motion.div>

      {/* Mascot flying towards planet */}
      <motion.div
        className="absolute z-10"
        initial={{ 
          x: "-30vw", 
          y: "20vh",
          scale: 0.5,
          rotate: 15,
        }}
        animate={{ 
          x: phase === "landing" ? "5vw" : "-5vw",
          y: phase === "landing" ? "-5vh" : "10vh",
          scale: phase === "landing" ? 1 : 0.8,
          rotate: phase === "landing" ? -5 : 10,
        }}
        transition={{ 
          duration: phase === "landing" ? 1.5 : 2.5,
          ease: "easeOut" 
        }}
      >
        {/* Glow trail */}
        <motion.div
          className="absolute inset-0 bg-primary/30 rounded-full blur-3xl scale-150"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1.5, 2, 1.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Bobbing mascot */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.img
            src={mothershipMascot}
            alt="Mothership"
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-contain"
            style={{
              filter: "drop-shadow(0 0 25px hsl(var(--primary) / 0.5))",
            }}
          />

          {/* Trail particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/60"
              style={{
                left: `-${10 + i * 8}px`,
                top: `${40 + (i % 2 === 0 ? -5 : 5)}%`,
              }}
              animate={{
                opacity: [0.8, 0],
                x: [-10, -40],
                scale: [1, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Activation text */}
      <motion.div
        className="absolute bottom-20 inset-x-0 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.p
          className="font-mono text-sm sm:text-base text-muted-foreground"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {phase === "flying" ? "Approaching signal..." : phase === "landing" ? "Activating MothershipX..." : "Signal acquired"}
        </motion.p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
