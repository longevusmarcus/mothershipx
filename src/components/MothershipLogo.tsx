import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MothershipLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function MothershipLogo({ collapsed = false, className }: MothershipLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Mark */}
      <motion.div
        className="relative h-10 w-10 shrink-0"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Outer ring with gradient */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-purple-500 opacity-80" />
        
        {/* Inner glow */}
        <div className="absolute inset-[2px] rounded-[10px] bg-gradient-to-br from-primary/20 to-purple-600/20 backdrop-blur-sm" />
        
        {/* Core shape - abstract "M" mothership */}
        <svg
          viewBox="0 0 40 40"
          className="absolute inset-0 h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ship body */}
          <path
            d="M20 8L32 20L28 24L20 16L12 24L8 20L20 8Z"
            className="fill-primary-foreground"
          />
          {/* Ship trail/thrust */}
          <path
            d="M14 26L20 20L26 26L24 32H16L14 26Z"
            className="fill-primary-foreground/80"
          />
          {/* Center dot */}
          <circle cx="20" cy="22" r="2" className="fill-primary-foreground" />
        </svg>

        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-xl bg-primary/30 blur-md -z-10 animate-pulse-slow" />
      </motion.div>

      {/* Wordmark */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex flex-col"
        >
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Mothership
          </span>
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Launch Pad
          </span>
        </motion.div>
      )}
    </div>
  );
}
