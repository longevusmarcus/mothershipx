import { motion, useScroll, useTransform } from "framer-motion";
import mothershipMascot from "@/assets/mothership-mascot.png";

interface FloatingMascotProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function FloatingMascot({ containerRef }: FloatingMascotProps) {
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  // Mascot appears from third section (Data Scraping) - ~0.28 scroll progress
  // With 6 sections: section 3 starts at 2/6 ≈ 0.33
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.28, 0.35, 0.85, 0.95],
    [0, 0, 1, 1, 0]
  );

  // X position - flies from left to right across the page (starts from section 3)
  const x = useTransform(
    scrollYProgress,
    [0.28, 0.9],
    ["-10vw", "85vw"]
  );

  // Y position - slight wave motion
  const baseY = useTransform(scrollYProgress, [0.28, 0.9], ["30vh", "60vh"]);

  // Rotation based on scroll direction (tilts in direction of movement)
  const rotate = useTransform(
    scrollYProgress,
    [0.28, 0.4, 0.55, 0.7, 0.9],
    [-10, 5, -5, 8, -5]
  );

  // Scale - slightly smaller so it doesn't obstruct
  const scale = useTransform(
    scrollYProgress,
    [0.28, 0.38, 0.8, 0.9],
    [0.5, 0.8, 0.8, 0.5]
  );

  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      style={{
        opacity,
        x,
        y: baseY,
        rotate,
        scale,
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Mascot with subtle bob */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.img
          src={mothershipMascot}
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
          style={{
            filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.4))",
          }}
        />

        {/* Trail particles */}
        <motion.div
          className="absolute -left-2 top-1/2 w-1 h-1 rounded-full bg-primary/50"
          animate={{
            opacity: [0.8, 0],
            x: [-5, -20],
            scale: [1, 0],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute -left-4 top-1/3 w-1 h-1 rounded-full bg-primary/30"
          animate={{
            opacity: [0.6, 0],
            x: [-5, -25],
            scale: [1, 0],
          }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
      </motion.div>
    </motion.div>
  );
}
