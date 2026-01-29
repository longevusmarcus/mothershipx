import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTypingSound } from "@/hooks/useTypingSound";

interface TerminalTypingProps {
  text: string;
  onComplete: () => void;
  typingSpeed?: number;
  soundEnabled?: boolean;
}

export function TerminalTyping({ 
  text, 
  onComplete, 
  typingSpeed = 35,
  soundEnabled = true 
}: TerminalTypingProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const { playKeystroke, playComplete, initAudio } = useTypingSound({ 
    volume: 0.12,
    variation: true 
  });

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!audioInitialized && soundEnabled) {
        initAudio();
        setAudioInitialized(true);
      }
    };

    // Try to init immediately and also listen for interactions
    handleInteraction();
    
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [initAudio, audioInitialized, soundEnabled]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Play keystroke sound (skip for spaces occasionally for natural feel)
        if (soundEnabled && audioInitialized) {
          if (text[currentIndex] !== " " || Math.random() > 0.7) {
            playKeystroke();
          }
        }
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      // Play completion sound
      if (soundEnabled && audioInitialized) {
        playComplete();
      }
      // Typing complete, wait a moment then trigger onComplete
      const timeout = setTimeout(onComplete, 1500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typingSpeed, onComplete, playKeystroke, playComplete, soundEnabled, audioInitialized]);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-mono text-sm sm:text-base md:text-lg leading-relaxed"
    >
      <span className="text-muted-foreground select-none">$ </span>
      <span className="text-foreground">{displayedText}</span>
      <span 
        className={`inline-block w-2 h-5 ml-0.5 bg-foreground align-middle transition-opacity ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
      />
    </motion.div>
  );
}
