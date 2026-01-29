import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import mothershipMascot from "@/assets/mothership-mascot.png";

interface OrbitingMascotProps {
  targetRef: React.RefObject<HTMLDivElement>;
}

export function OrbitingMascot({ targetRef }: OrbitingMascotProps) {
  const isInView = useInView(targetRef, { once: true, amount: 0.5 });
  const [phase, setPhase] = useState<"hidden" | "entering" | "orbiting" | "exiting" | "done">("hidden");
  
  useEffect(() => {
    if (isInView && phase === "hidden") {
      // Start the sequence
      setPhase("entering");
      
      // After entering, start orbiting
      const orbitTimer = setTimeout(() => {
        setPhase("orbiting");
      }, 600);
      
      // After orbiting (2 full rotations), exit
      const exitTimer = setTimeout(() => {
        setPhase("exiting");
      }, 3600); // 600ms enter + 3000ms orbit
      
      // Mark as done
      const doneTimer = setTimeout(() => {
        setPhase("done");
      }, 4600);
      
      return () => {
        clearTimeout(orbitTimer);
        clearTimeout(exitTimer);
        clearTimeout(doneTimer);
      };
    }
  }, [isInView, phase]);

  if (phase === "hidden" || phase === "done") return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {/* Orbiting mascot */}
      <motion.div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          marginLeft: -20,
          marginTop: -20,
        }}
        initial={{ 
          x: -200, 
          y: 0, 
          opacity: 0,
          scale: 0.5,
        }}
        animate={
          phase === "entering"
            ? { 
                x: 100, 
                y: -60, 
                opacity: 1, 
                scale: 0.8,
              }
            : phase === "orbiting"
            ? { 
                opacity: 1, 
                scale: 0.8,
              }
            : phase === "exiting"
            ? { 
                x: 300, 
                y: -150, 
                opacity: 0, 
                scale: 0.4,
              }
            : {}
        }
        transition={
          phase === "entering"
            ? { duration: 0.6, ease: "easeOut" }
            : phase === "exiting"
            ? { duration: 1, ease: "easeIn" }
            : {}
        }
      >
        {/* Orbit animation container */}
        <motion.div
          animate={phase === "orbiting" ? {
            rotate: [0, 360, 720],
          } : {}}
          transition={
            phase === "orbiting" 
              ? { 
                  duration: 3, 
                  ease: "linear",
                }
              : {}
          }
          style={{
            width: 180,
            height: 100,
            transformOrigin: "center center",
          }}
        >
          {/* The mascot on the orbit path */}
          <motion.div
            className="absolute"
            style={{
              left: "50%",
              top: 0,
              marginLeft: -20,
              marginTop: -20,
            }}
            animate={phase === "orbiting" ? {
              rotate: [0, -360, -720], // Counter-rotate to keep upright
            } : {}}
            transition={
              phase === "orbiting" 
                ? { 
                    duration: 3, 
                    ease: "linear",
                  }
                : {}
            }
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-150" />
            
            {/* Mascot with bob */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={mothershipMascot}
                alt=""
                className="w-10 h-10 object-contain"
                style={{
                  filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.5))",
                }}
              />
            </motion.div>
            
            {/* Trail particles */}
            <motion.div
              className="absolute -left-1 top-1/2 w-1 h-1 rounded-full bg-primary/60"
              animate={{
                opacity: [0.8, 0],
                x: [-3, -12],
                scale: [1, 0],
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
