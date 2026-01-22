import { useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementBadgeProps {
  icon: LucideIcon;
  name: string;
  description: string;
  isUnlocked: boolean;
  isNew?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AchievementBadge({
  icon: Icon,
  name,
  description,
  isUnlocked,
  isNew = false,
  size = "md",
}: AchievementBadgeProps) {
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  useEffect(() => {
    if (isNew && isUnlocked) {
      setShowUnlockAnimation(true);
      const timer = setTimeout(() => setShowUnlockAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isNew, isUnlocked]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="relative">
            <AnimatePresence>
              {showUnlockAnimation && (
                <>
                  {/* Outer glow ring */}
                  <motion.div
                    className={`absolute inset-0 ${sizeClasses[size]} rounded-full`}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{
                      scale: [1, 1.8, 2.2],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                      background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)",
                    }}
                  />
                  {/* Inner pulse */}
                  <motion.div
                    className={`absolute inset-0 ${sizeClasses[size]} rounded-full`}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{
                      scale: [1, 1.3, 1.5],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    style={{
                      background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 60%)",
                    }}
                  />
                </>
              )}
            </AnimatePresence>

            <motion.div
              className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all relative ${
                isUnlocked
                  ? "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-lg"
                  : "bg-muted/30 border border-border/50"
              }`}
              initial={isNew && isUnlocked ? { scale: 0.5, opacity: 0 } : false}
              animate={
                isNew && isUnlocked
                  ? {
                      scale: [0.5, 1.15, 1],
                      opacity: 1,
                    }
                  : {}
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={isUnlocked ? { scale: 1.1 } : { scale: 1.02 }}
            >
              {/* Subtle shine effect for unlocked badges */}
              {isUnlocked && (
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
                    }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              )}

              <Icon
                className={`${iconSizes[size]} relative z-10 ${
                  isUnlocked ? "text-white" : "text-muted-foreground/50"
                }`}
              />
            </motion.div>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          sideOffset={8} 
          className="z-[100] max-w-[200px]"
        >
          <div className="text-center">
            <p className="font-medium text-sm">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            {!isUnlocked && (
              <p className="text-xs text-amber-500 mt-1 font-medium">🔒 Locked</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
