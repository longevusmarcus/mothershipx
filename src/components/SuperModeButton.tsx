import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { AutoBuildModal } from "@/components/AutoBuildModal";

export function SuperModeButton() {
  const [superModeOpen, setSuperModeOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setSuperModeOpen(true);
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/5 transition-colors group"
      >
        {/* Animated glow background */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"
            />
          )}
        </AnimatePresence>

        {/* Zap icon with pulse */}
        <div className="relative z-10">
          <motion.div
            animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Zap className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
          
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/40"
            animate={{ 
              scale: [1, 1.8, 1], 
              opacity: [0.6, 0, 0.6] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </div>

        {/* Text label */}
        <span className="relative z-10 font-mono text-[11px] tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
          Super Mode
        </span>

        {/* Sliding activation indicator */}
        <div className="relative z-10 w-8 h-4 rounded-full bg-muted/50 border border-border/50 overflow-hidden">
          <motion.div
            className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-muted-foreground/50 group-hover:bg-primary transition-colors"
            animate={isHovered ? { x: 12 } : { x: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          
          {/* Glow effect when hovered */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-primary/30 rounded-full"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      <AutoBuildModal open={superModeOpen} onOpenChange={setSuperModeOpen} />
    </>
  );
}
