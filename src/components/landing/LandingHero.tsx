import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";
import showcaseSignals from "@/assets/showcase-signals.png";
import showcaseDetail from "@/assets/showcase-detail.png";
import showcaseArena from "@/assets/showcase-arena.png";

export function LandingHero() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroScrollProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(heroScrollProgress, [0, 0.5], [0, -100]);

  const handleEnter = () => {
    localStorage.setItem("mothershipx-visited", "true");
    navigate("/problems");
  };

  // Keyboard listener for Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="bg-background">
      {/* Hero Section - First viewport */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden sticky top-0"
      >
        {/* Subtle dot grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Trembling Matrix Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mb-12"
          >
            <motion.div 
              className="relative"
              animate={{ 
                x: [0, -1, 1, -1, 0, 1, -1, 0],
                y: [0, 1, -1, 0, 1, -1, 1, 0],
              }}
              transition={{ 
                duration: 0.15,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 relative">
                <img 
                  src={logoIcon} 
                  alt="MothershipX" 
                  className="w-full h-full object-contain dark:invert-0 invert" 
                />
                {/* Glitch overlay effect */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ 
                    opacity: [0, 0.3, 0, 0.2, 0],
                    x: [0, 2, -2, 1, 0],
                  }}
                  transition={{ 
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <img 
                    src={logoIcon} 
                    alt="" 
                    className="w-full h-full object-contain dark:invert-0 invert opacity-50 mix-blend-screen" 
                    style={{ filter: "hue-rotate(90deg)" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Main headline - No buttons */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-foreground leading-[1.1]"
          >
            Know what to build.
            <br />
            <span className="text-muted-foreground">Compete to ship it.</span>
            <br />
            Earn rewards from
            <br />
            <em className="font-accent">real outcomes.</em>
          </motion.h1>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-1 h-2 rounded-full bg-muted-foreground/50"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Spacer for sticky hero */}
      <div className="h-screen" />

      {/* Second Section - Tagline + Screenshots */}
      <section className="min-h-screen py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-20"
          >
            Build useful apps, websites, and digital products at the speed of thought—backed by real market demand and rewarded for <em className="text-foreground font-accent">real impact.</em>
          </motion.p>

          {/* Screenshots with parallax tilt effect */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {/* Left screenshot - tilted left */}
            <ScreenshotCard 
              image={showcaseSignals}
              alt="Live Signals Dashboard"
              rotation={-6}
              delay={0}
            />

            {/* Center screenshot - straight, larger */}
            <ScreenshotCard 
              image={showcaseDetail}
              alt="Problem Analysis"
              rotation={0}
              delay={0.1}
              isCenter
            />

            {/* Right screenshot - tilted right */}
            <ScreenshotCard 
              image={showcaseArena}
              alt="Builder Arena"
              rotation={6}
              delay={0.2}
            />
          </div>

          {/* Subtle glow behind center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <Button 
            onClick={handleEnter}
            size="lg"
            className="group text-base px-8 py-6 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Enter MothershipX
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="mt-6 text-xs text-muted-foreground/50 font-mono">
            Press Enter to begin →
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 MothershipX. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Screenshot card with 3D scroll perspective effect
function ScreenshotCard({ 
  image, 
  alt, 
  rotation, 
  delay,
  isCenter = false 
}: { 
  image: string; 
  alt: string; 
  rotation: number;
  delay: number;
  isCenter?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: rotation < 0 ? -40 : rotation > 0 ? 40 : 0, rotate: rotation }}
      whileInView={{ opacity: 1, x: 0, rotate: rotation }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ rotate: 0, scale: 1.02, y: -8 }}
      style={{ rotateX, scale, opacity }}
      className={`relative shrink-0 ${
        isCenter 
          ? "w-full max-w-[380px] sm:max-w-[440px] md:w-80 lg:w-96 z-10" 
          : "w-full max-w-[320px] sm:max-w-[380px] md:w-64 lg:w-72"
      }`}
    >
      <div 
        className="relative rounded-xl overflow-hidden shadow-2xl shadow-background/50 border border-border/30"
        style={{ perspective: "1000px" }}
      >
        <img 
          src={image} 
          alt={alt} 
          className="block w-full h-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
