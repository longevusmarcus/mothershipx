import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ONBOARDING_KEY = "matrix_dashboard_seen";

interface MatrixOnboardingEffectProps {
  show: boolean;
  onComplete: () => void;
}

// Sophisticated data visualization particles
interface DataParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function generateParticles(count: number): DataParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1 + 0.5,
  }));
}

export function MatrixOnboardingEffect({ show, onComplete }: MatrixOnboardingEffectProps) {
  const [particles] = useState(() => generateParticles(40));
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"scanning" | "complete">("scanning");

  useEffect(() => {
    if (!show) return;

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Complete after 2 seconds
    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {phase !== "complete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] bg-background overflow-hidden"
        >
          {/* Elegant grid background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-primary/30"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: particle.duration + 1,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Horizontal scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)',
            }}
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.8, ease: "linear" }}
          />

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="text-center z-10"
            >
              {/* Minimal elegant container */}
              <div className="relative">
                {/* Outer glow ring */}
                <motion.div
                  className="absolute -inset-8 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative bg-card/80 backdrop-blur-md border border-border/50 rounded-xl px-10 py-8 shadow-2xl">
                  {/* Pulsing dot indicator */}
                  <motion.div
                    className="flex items-center justify-center gap-2 mb-5"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <motion.div 
                      className="h-2 w-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs text-primary/80 uppercase tracking-[0.2em] font-medium">
                      Initializing
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    className="text-lg font-medium text-foreground mb-6 tracking-tight"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Building Dashboard
                  </motion.h2>

                  {/* Elegant progress bar */}
                  <div className="w-56 mx-auto">
                    <div className="h-0.5 bg-border/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, hsl(var(--primary) / 0.5), hsl(var(--primary)))',
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.05 }}
                      />
                    </div>
                    <div className="flex justify-between mt-3">
                      <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                        {progress}%
                      </span>
                      <motion.span 
                        className="text-[10px] text-muted-foreground/60"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Loading data...
                      </motion.span>
                    </div>
                  </div>

                  {/* Subtle status items */}
                  <motion.div
                    className="mt-6 flex justify-center gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {["Signals", "Builders", "Market"].map((item, i) => (
                      <motion.div
                        key={item}
                        className="flex items-center gap-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: progress > (i + 1) * 25 ? 1 : 0.3 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className={`h-1 w-1 rounded-full ${progress > (i + 1) * 25 ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        />
                        <span className={`text-[10px] ${progress > (i + 1) * 25 ? 'text-foreground/70' : 'text-muted-foreground/30'}`}>
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-6 left-6 w-12 h-12 border-l border-t border-primary/10 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-12 h-12 border-r border-t border-primary/10 rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-l border-b border-primary/10 rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b border-primary/10 rounded-br-lg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage the matrix onboarding state
export function useMatrixOnboarding() {
  const [showMatrix, setShowMatrix] = useState(false);
  const [hasCompletedMatrix, setHasCompletedMatrix] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeen) {
      setShowMatrix(true);
    } else {
      setHasCompletedMatrix(true);
    }
  }, []);

  const handleMatrixComplete = () => {
    setShowMatrix(false);
    setHasCompletedMatrix(true);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  return {
    showMatrix,
    hasCompletedMatrix,
    handleMatrixComplete,
  };
}
