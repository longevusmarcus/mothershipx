import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TerminalTypingProps {
  text: string;
  onComplete: () => void;
  typingSpeed?: number;
}

export function TerminalTyping({ text, onComplete, typingSpeed = 35 }: TerminalTypingProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      // Typing complete, wait a moment then trigger onComplete
      const timeout = setTimeout(onComplete, 1500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typingSpeed, onComplete]);

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
