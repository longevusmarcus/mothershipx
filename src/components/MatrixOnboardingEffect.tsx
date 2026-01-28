import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ONBOARDING_KEY = "matrix_dashboard_seen";

interface MatrixOnboardingEffectProps {
  show: boolean;
  onComplete: () => void;
}

// Matrix-style characters for the effect
const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

interface MatrixColumn {
  id: number;
  x: number;
  speed: number;
  chars: string[];
  delay: number;
}

function generateMatrixColumns(count: number): MatrixColumn[] {
  const columns: MatrixColumn[] = [];
  for (let i = 0; i < count; i++) {
    const charCount = Math.floor(Math.random() * 15) + 8;
    const chars: string[] = [];
    for (let j = 0; j < charCount; j++) {
      chars.push(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]);
    }
    columns.push({
      id: i,
      x: (i / count) * 100,
      speed: Math.random() * 0.5 + 0.5,
      chars,
      delay: Math.random() * 0.5,
    });
  }
  return columns;
}

export function MatrixOnboardingEffect({ show, onComplete }: MatrixOnboardingEffectProps) {
  const [columns] = useState(() => generateMatrixColumns(30));
  const [phase, setPhase] = useState<"matrix" | "scanning" | "complete">("matrix");
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (!show) return;

    // Phase 1: Matrix rain (0.8s)
    const matrixTimer = setTimeout(() => {
      setPhase("scanning");
    }, 800);

    // Phase 2: Scanning effect (1s)
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    // Phase 3: Complete (2s total)
    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(matrixTimer);
      clearTimeout(completeTimer);
      clearInterval(scanInterval);
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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] bg-background overflow-hidden"
        >
          {/* Matrix rain background */}
          <div className="absolute inset-0 overflow-hidden">
            {columns.map((column) => (
              <motion.div
                key={column.id}
                className="absolute top-0 flex flex-col text-xs font-mono"
                style={{ left: `${column.x}%` }}
                initial={{ y: "-100%" }}
                animate={{ y: "100vh" }}
                transition={{
                  duration: 2 / column.speed,
                  delay: column.delay,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {column.chars.map((char, i) => (
                  <span
                    key={i}
                    className="leading-tight"
                    style={{
                      color: i === 0 
                        ? "hsl(var(--primary))" 
                        : `hsla(var(--primary), ${Math.max(0.1, 1 - i * 0.08)})`,
                      textShadow: i === 0 ? "0 0 10px hsl(var(--primary))" : "none",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-center z-10"
            >
              {/* Terminal-style box */}
              <div className="bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg px-8 py-6 shadow-2xl shadow-primary/20">
                {/* Status indicator */}
                <motion.div
                  className="flex items-center justify-center gap-2 mb-4"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-mono text-xs text-primary uppercase tracking-widest">
                    {phase === "matrix" ? "INITIALIZING" : "SCANNING"}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="font-mono text-lg font-medium text-foreground mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  LOADING DASHBOARD
                </motion.h2>

                {/* Progress bar */}
                <div className="w-48 mx-auto">
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.05 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {scanProgress}%
                    </span>
                    <span className="font-mono text-[10px] text-primary/70">
                      {phase === "matrix" ? "CONNECTING..." : "SYNCING DATA..."}
                    </span>
                  </div>
                </div>

                {/* Scan lines effect */}
                {phase === "scanning" && (
                  <motion.div
                    className="mt-4 space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {["MARKET_SIGNALS", "BUILDER_NETWORK", "OPPORTUNITY_INDEX"].map((line, i) => (
                      <motion.div
                        key={line}
                        className="font-mono text-[10px] text-primary/60 flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <span className="text-success">✓</span>
                        <span>{line}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Scan line sweep effect */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
          />
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
