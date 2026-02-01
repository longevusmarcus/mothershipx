import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Problem } from "@/types/database";
import { cn } from "@/lib/utils";
import mascotUfo from "@/assets/mascot-ufo.png";
import mothershipPlanet from "@/assets/mothership-planet.png";

interface SignalOfTheDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problems: Problem[];
}

export function SignalOfTheDayModal({ open, onOpenChange, problems }: SignalOfTheDayModalProps) {
  const navigate = useNavigate();
  const [selectedSignal, setSelectedSignal] = useState<Problem | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Pick a "signal of the day" based on current date (deterministic daily pick)
  const getSignalOfTheDay = () => {
    if (problems.length === 0) return null;
    
    // Use date as seed for consistent daily selection
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Sort by opportunity score and pick from top performers
    const topSignals = [...problems]
      .sort((a, b) => b.opportunity_score - a.opportunity_score)
      .slice(0, Math.min(10, problems.length));
    
    const index = seed % topSignals.length;
    return topSignals[index];
  };

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setIsRevealing(false);
      setRevealed(false);
      setSelectedSignal(null);
    }
  }, [open]);

  const handleReveal = () => {
    setIsRevealing(true);
    
    // Reveal animation sequence
    setTimeout(() => {
      setSelectedSignal(getSignalOfTheDay());
      setTimeout(() => {
        setRevealed(true);
        setIsRevealing(false);
      }, 400);
    }, 800);
  };

  const handleExplore = () => {
    if (selectedSignal) {
      onOpenChange(false);
      navigate(`/problem/${selectedSignal.id}`);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "exploding": return "text-green-400";
      case "rising": return "text-emerald-400";
      case "stable": return "text-blue-400";
      default: return "text-white/70";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-black border-primary/20 [&>button]:text-white [&>button]:hover:text-white/80">
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-10" />

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="font-mono text-base text-white tracking-wide">Signal of the Day</h2>
            <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
              your daily opportunity
            </p>
          </div>

          {/* Main Content Area */}
          <div className="min-h-[200px] flex flex-col">
            <AnimatePresence mode="wait">
              {!revealed && !isRevealing && (
              <motion.div
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center py-8"
                >
                  {/* Mascot and planet flying together */}
                  <div className="mb-6 relative h-28 w-full flex items-center justify-center">
                    {/* Combined flying group */}
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{ 
                        x: [0, 15, 0],
                        y: [0, -8, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Mascot */}
                      <motion.img 
                        src={mascotUfo} 
                        alt="Mascot" 
                        className="h-16 w-16 object-contain drop-shadow-lg"
                        animate={{ rotate: [0, 3, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      
                      {/* Planet */}
                      <motion.img 
                        src={mothershipPlanet} 
                        alt="Planet" 
                        className="h-14 w-14 object-contain opacity-90"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                    
                    {/* Trail particles */}
                    <motion.div
                      className="absolute left-1/4 top-1/2 -translate-y-1/2 w-12 h-0.5 bg-gradient-to-r from-primary/40 to-transparent rounded-full"
                      animate={{ opacity: [0, 0.6, 0], x: [-10, -30] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute left-1/4 top-1/2 -translate-y-1/2 mt-2 w-8 h-0.5 bg-gradient-to-r from-primary/30 to-transparent rounded-full"
                      animate={{ opacity: [0, 0.4, 0], x: [-5, -25] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>

                  <p className="text-white/60 font-mono text-sm text-center mb-6">
                    Discover today's top<br />opportunity picked for you
                  </p>

                  <motion.button
                    onClick={handleReveal}
                    className="px-6 py-3 rounded-lg bg-primary/20 border border-primary/40 font-mono text-sm text-white hover:bg-primary/30 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reveal Signal
                  </motion.button>
                </motion.div>
              )}

              {isRevealing && (
                <motion.div
                  key="revealing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center py-8"
                >
                  {/* Scanning animation */}
                  <div className="relative w-full h-32 mb-4">
                    <motion.div
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 0.8, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="font-mono text-xs text-primary/80 uppercase tracking-widest"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                      >
                        Analyzing signals...
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {revealed && selectedSignal && (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex-1"
                >
                  {/* Signal Card */}
                  <div className="bg-white/5 rounded-lg border border-white/10 p-4 mb-4">
                    {/* Sentiment Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className={cn("h-3.5 w-3.5", getSentimentColor(selectedSignal.sentiment))} />
                      <span className={cn(
                        "text-[10px] font-mono uppercase tracking-wider",
                        getSentimentColor(selectedSignal.sentiment)
                      )}>
                        {selectedSignal.sentiment}
                      </span>
                      <span className="text-white/30 text-[10px] font-mono">•</span>
                      <span className="text-[10px] font-mono text-white/50">
                        {selectedSignal.opportunity_score}% match
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-mono text-base text-white mb-2 leading-tight">
                      {selectedSignal.title}
                    </h3>

                    {/* Subtitle */}
                    {selectedSignal.subtitle && (
                      <p className="font-mono text-xs text-white/50 mb-3 line-clamp-2">
                        {selectedSignal.subtitle}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-white/40 uppercase">Category</span>
                        <span className="text-[10px] font-mono text-white/70">{selectedSignal.category}</span>
                      </div>
                      {selectedSignal.market_size && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-white/40 uppercase">Market</span>
                          <span className="text-[10px] font-mono text-white/70">{selectedSignal.market_size}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => {
                        setRevealed(false);
                        setSelectedSignal(null);
                        handleReveal();
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 font-mono text-xs text-white/60 hover:text-white hover:border-white/20 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Shuffle
                    </motion.button>
                    <motion.button
                      onClick={handleExplore}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-primary/20 border border-primary/40 font-mono text-xs text-white hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Explore
                      <ArrowRight className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer hint */}
          <motion.p 
            className="text-[10px] font-mono text-white/30 text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Updated daily based on trend momentum
          </motion.p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
