import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WaitlistForm } from "@/components/WaitlistForm";
import { useKeyboardSound } from "@/hooks/useKeyboardSound";
import lovableLogo from "@/assets/lovable-logo.png";

interface AutoBuildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPING_LINES = [
  "$ initiating signal analysis...",
  "$ scanning 847 market opportunities...",
  "$ auto-generating startup ideas from live data...",
  "$ building landing pages with AI...",
  "$ registering domain names...",
  "$ implementing Stripe payment buttons...",
  "$ deploying to edge network...",
  "$ testing in headless Chrome...",
  "$ validating product-market fit...",
  "$ process complete. awaiting human confirmation.",
];

export function AutoBuildModal({ open, onOpenChange }: AutoBuildModalProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const hasInteractedRef = useRef(false);
  
  const { playKeyClick, playKeyRelease, playSuccess } = useKeyboardSound();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentLineIndex(0);
      setCurrentText("");
      setCompletedLines([]);
      setIsTypingComplete(false);
      setShowWaitlist(false);
      // Enable sound after user interaction (opening modal counts)
      hasInteractedRef.current = true;
      setSoundEnabled(true);
    }
  }, [open]);

  // Typing effect with sound
  useEffect(() => {
    if (!open || isTypingComplete) return;

    const currentLine = TYPING_LINES[currentLineIndex];
    
    if (currentText.length < currentLine.length) {
      const timeout = setTimeout(() => {
        // Play keyboard click sound (alternate between click and release for variety)
        if (soundEnabled && hasInteractedRef.current) {
          if (Math.random() > 0.3) {
            playKeyClick();
          } else {
            playKeyRelease();
          }
        }
        setCurrentText(currentLine.slice(0, currentText.length + 1));
      }, 25 + Math.random() * 35); // Variable typing speed for realism
      return () => clearTimeout(timeout);
    } else {
      // Line complete, move to next
      const timeout = setTimeout(() => {
        setCompletedLines(prev => [...prev, currentLine]);
        setCurrentText("");
        
        if (currentLineIndex < TYPING_LINES.length - 1) {
          setCurrentLineIndex(prev => prev + 1);
        } else {
          setIsTypingComplete(true);
          // Play success sound when complete
          if (soundEnabled) {
            playSuccess();
          }
          setTimeout(() => setShowWaitlist(true), 500);
        }
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [open, currentText, currentLineIndex, isTypingComplete, soundEnabled, playKeyClick, playKeyRelease, playSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-black border-primary/20">
        {/* Matrix rain effect background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="matrix-rain" />
        </div>
        
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
        
        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
                <img src={lovableLogo} alt="Lovable" className="h-5 w-5 object-contain" />
              </div>
              <motion.div 
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div>
              <h2 className="font-mono text-lg text-primary tracking-wide">MOTHERSHIP_X</h2>
              <p className="font-mono text-xs text-primary/60">autonomous builder protocol v2.0</p>
            </div>
          </div>

          {/* Terminal window */}
          <div className="bg-black/80 rounded-lg border border-primary/20 p-4 font-mono text-sm min-h-[280px]">
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/80" />
              </div>
              <span className="text-primary/40 text-xs ml-2">~/mothership/auto-build</span>
            </div>

            {/* Terminal output */}
            <div className="space-y-1.5 text-primary/90">
              {completedLines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-success">✓</span>
                  <span className="text-primary/70">{line}</span>
                </motion.div>
              ))}
              
              {!isTypingComplete && (
                <div className="flex items-center gap-2">
                  <motion.span 
                    className="text-primary"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ▶
                  </motion.span>
                  <span className="text-primary">{currentText}</span>
                  <motion.span
                    className="inline-block w-2 h-4 bg-primary"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Waitlist section */}
          <AnimatePresence>
            {showWaitlist && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="font-mono text-xs text-primary/80 uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
                
                <h3 className="text-lg font-light text-foreground mb-2">
                  Autonomous Building Protocol
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  AI agents that transform signals into deployed startups—landing pages, 
                  domains, payments, and testing—all automated.
                </p>
                
                <WaitlistForm 
                  feature="builds" 
                  buttonText="Join Waitlist"
                  variant="default"
                  className="justify-center"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
