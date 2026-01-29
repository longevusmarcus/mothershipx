import { useRef, useCallback, useEffect } from "react";

interface TypingSoundOptions {
  volume?: number;
  variation?: boolean;
}

export function useTypingSound(options: TypingSoundOptions = {}) {
  const { volume = 0.15, variation = true } = options;
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, [volume]);

  // Play a single keystroke sound
  const playKeystroke = useCallback(() => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      initAudio();
    }
    
    const ctx = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    
    if (!ctx || !gainNode) return;

    // Create oscillator for the click
    const oscillator = ctx.createOscillator();
    const clickGain = ctx.createGain();
    
    // Add variation to make it sound more natural
    const baseFreq = variation ? 1800 + Math.random() * 400 : 2000;
    const clickVolume = variation ? 0.8 + Math.random() * 0.4 : 1;
    
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);
    
    // Quick attack and decay for clicky sound
    clickGain.gain.setValueAtTime(0, ctx.currentTime);
    clickGain.gain.linearRampToValueAtTime(clickVolume * volume, ctx.currentTime + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    oscillator.connect(clickGain);
    clickGain.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);

    // Add a subtle noise burst for mechanical feel
    if (variation && Math.random() > 0.3) {
      const bufferSize = ctx.sampleRate * 0.015;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3;
      }
      
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      
      noise.buffer = noiseBuffer;
      noiseGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
      
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime + 0.002);
    }
  }, [initAudio, volume, variation]);

  // Play a special "enter" or completion sound
  const playComplete = useCallback(() => {
    if (!audioContextRef.current) {
      initAudio();
    }
    
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Rising tone for completion
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }, [initAudio, volume]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { 
    playKeystroke, 
    playComplete,
    initAudio 
  };
}
