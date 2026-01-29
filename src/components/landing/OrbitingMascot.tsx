import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import mothershipMascot from "@/assets/mothership-mascot.png";

interface OrbitingMascotProps {
  targetRef: React.RefObject<HTMLDivElement>;
}

export function OrbitingMascot({ targetRef }: OrbitingMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(targetRef, { once: true, amount: 0.3 });

  if (!isInView) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: "visible" }}>
      {/* Container centered on the text */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ marginLeft: -16, marginTop: -16 }}
        initial={{ opacity: 0, scale: 0, x: -150 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Orbit container - this rotates around the center */}
        <motion.div
          style={{
            width: 280,
            height: 80,
            marginLeft: -140,
            marginTop: -40,
          }}
          animate={{ rotate: 720 }}
          transition={{
            duration: 4,
            ease: "linear",
            delay: 0.5,
          }}
        >
          {/* Mascot positioned at edge of orbit */}
          <motion.div
            className="absolute"
            style={{ right: -16, top: "50%", marginTop: -16 }}
            animate={{ rotate: -720 }}
            transition={{
              duration: 4,
              ease: "linear",
              delay: 0.5,
            }}
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-150" />
            
            {/* Mascot with subtle bob */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={mothershipMascot}
                alt=""
                className="w-8 h-8 object-contain"
                style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.4))" }}
              />
            </motion.div>
            
            {/* Trail */}
            <motion.div
              className="absolute -left-1 top-1/2 w-0.5 h-0.5 rounded-full bg-primary/50"
              animate={{ opacity: [0.6, 0], x: [-2, -10], scale: [1, 0] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Exit animation - flies away after orbiting */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ marginLeft: -16, marginTop: -16 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1], x: [0, 0, 200], y: [0, 0, -100], scale: [0.8, 0.8, 0] }}
        transition={{ duration: 5.5, times: [0, 0.82, 1], ease: "easeIn" }}
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-150" />
        <img
          src={mothershipMascot}
          alt=""
          className="w-8 h-8 object-contain"
          style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.4))" }}
        />
      </motion.div>
    </div>
  );
}
