import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [hasChanged, setHasChanged] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (value !== prevValue) {
      setHasChanged(true);
      setPrevValue(value);
      
      const timeout = setTimeout(() => {
        setHasChanged(false);
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [value, prevValue]);

  return (
    <motion.span
      className={className}
      animate={hasChanged ? {
        scale: [1, 1.2, 1],
        color: ["hsl(var(--foreground))", "hsl(var(--primary))", "hsl(var(--foreground))"],
      } : {}}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      {value}
    </motion.span>
  );
}
