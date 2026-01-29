import { motion } from "framer-motion";
import { FadeInOnScroll, ScaleOnScroll } from "./ParallaxEffects";
import { TrendingUp, Zap, Trophy, Target, Rocket, Users } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:border-foreground/20">
      <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
        {icon}
      </div>
      <h3 className="font-display text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-foreground" />,
      title: "Real-time Signals",
      description: "Discover trending problems from TikTok, Reddit, and YouTube with proven momentum."
    },
    {
      icon: <Target className="w-6 h-6 text-foreground" />,
      title: "Pain Point Analysis",
      description: "AI-powered insights reveal exactly what users are struggling with and willing to pay for."
    },
    {
      icon: <Zap className="w-6 h-6 text-foreground" />,
      title: "Rapid Validation",
      description: "Test ideas in days, not months. Build landing pages and wire up payments instantly."
    },
    {
      icon: <Users className="w-6 h-6 text-foreground" />,
      title: "Builder Community",
      description: "Join forces with other builders. Form squads. Ship faster together."
    },
    {
      icon: <Trophy className="w-6 h-6 text-foreground" />,
      title: "Compete & Earn",
      description: "Enter challenges, build solutions, and earn rewards based on real market impact."
    },
    {
      icon: <Rocket className="w-6 h-6 text-foreground" />,
      title: "Market Graduation",
      description: "Top products graduate into live markets with ongoing distribution and revenue."
    }
  ];

  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <FadeInOnScroll className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-mono">How it works</p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal mb-6">
            From signal to <em className="font-accent">shipped product</em>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The complete pipeline from discovering what to build to earning from what you ship.
          </p>
        </FadeInOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FadeInOnScroll key={feature.title} delay={index * 0.1}>
              <FeatureCard {...feature} />
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ShowcaseSectionProps {
  title: string;
  subtitle: string;
  features: string[];
  screenshotPlaceholder: string;
  reverse?: boolean;
}

export function ShowcaseSection({ title, subtitle, features, screenshotPlaceholder, reverse }: ShowcaseSectionProps) {
  return (
    <section className="py-24 px-6">
      <div className={`max-w-6xl mx-auto flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
        {/* Text side */}
        <FadeInOnScroll className="flex-1 space-y-8">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-mono">{subtitle}</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal leading-tight">
              {title}
            </h2>
          </div>
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2.5 shrink-0" />
                <span className="text-lg text-muted-foreground">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </FadeInOnScroll>

        {/* Screenshot side */}
        <ScaleOnScroll className="flex-1 w-full">
          <div className="relative">
            {/* Browser frame */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
              {/* Browser header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-destructive/40" />
                <div className="w-3 h-3 rounded-full bg-warning/40" />
                <div className="w-3 h-3 rounded-full bg-success/40" />
                <div className="flex-1 mx-4">
                  <div className="h-6 rounded-md bg-muted/50 max-w-xs mx-auto flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono">mothershipx.lovable.app</span>
                  </div>
                </div>
              </div>
              {/* Screenshot placeholder */}
              <div className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-foreground/10 mx-auto flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-foreground/40" />
                  </div>
                  <p className="text-muted-foreground/60 font-mono text-sm">{screenshotPlaceholder}</p>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-radial from-primary/10 to-transparent rounded-3xl blur-2xl -z-10" />
          </div>
        </ScaleOnScroll>
      </div>
    </section>
  );
}
