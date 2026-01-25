import { useCallback, useRef } from "react";

export function useKeyboardSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playKeyClick = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      // Create oscillator for the click sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Configure for a subtle mechanical keyboard click
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(1800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.02);
      
      // Very short, subtle envelope
      gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      // Play the sound
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (e) {
      // Silently fail if audio not supported
      console.debug("Audio not supported:", e);
    }
  }, [getAudioContext]);

  const playKeyRelease = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Slightly different sound for variety
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.015);
      
      gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.02);
    } catch (e) {
      console.debug("Audio not supported:", e);
    }
  }, [getAudioContext]);

  const playSuccess = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      // Two-tone success chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.type = "sine";
      osc2.type = "sine";
      
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.debug("Audio not supported:", e);
    }
  }, [getAudioContext]);

  return { playKeyClick, playKeyRelease, playSuccess };
}
