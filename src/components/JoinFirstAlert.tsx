import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import mascotUfo from "@/assets/mascot-ufo.png";

interface JoinFirstAlertProps {
  open: boolean;
  onClose: () => void;
  onJoin: () => void;
}

export function JoinFirstAlert({ open, onClose, onJoin }: JoinFirstAlertProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Alert Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-10 p-1.5 rounded-full hover:bg-muted/80 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="relative p-6 pt-8">
                {/* Mascot Animation */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    {/* Glow effect behind mascot */}
                    <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full scale-150" />
                    <img src={mascotUfo} alt="Mascot" className="relative h-20 w-20 drop-shadow-lg" />
                  </motion.div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2 mb-6">
                  <h3 className="font-display text-lg font-medium tracking-tight">Join the signal first</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ready to build? Join this signal to unlock launching, submit creations, compete in the league, and
                    earn rewards
                  </p>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onJoin();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-foreground text-background font-medium text-sm transition-all hover:opacity-90"
                >
                  Join Signal (free)
                </motion.button>

                {/* Subtle footer hint */}
                <p className="text-center text-xs text-muted-foreground/60 mt-4">You can leave anytime</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
