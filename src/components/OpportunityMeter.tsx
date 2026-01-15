import { motion } from "framer-motion";

interface OpportunityMeterProps {
  score: number;
  marketSize: string;
  demandVelocity: number;
  competitionGap: number;
  size?: "compact" | "full";
}

export function OpportunityMeter({
  score,
  marketSize,
  demandVelocity,
  competitionGap,
  size = "full",
}: OpportunityMeterProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 85) return "High Potential";
    if (score >= 70) return "Promising";
    return "Emerging";
  };

  if (size === "compact") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
          <span className="text-sm font-semibold text-background">{score}</span>
        </div>
        <div className="text-xs">
          <p className="font-medium">{marketSize}</p>
          <p className="text-muted-foreground">Market</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Main Score */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-lg bg-foreground flex items-center justify-center">
          <span className="text-xl font-semibold text-background">{score}</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Opportunity Score</p>
          <p className="text-sm font-medium mt-0.5">{getScoreLabel(score)}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Market Size</span>
          <span className="text-sm font-medium">{marketSize}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Demand Velocity</span>
            <span className="text-sm font-medium text-success">+{demandVelocity}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(demandVelocity, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-foreground rounded-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Competition Gap</span>
            <span className="text-sm font-medium">{competitionGap}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${competitionGap}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="h-full bg-muted-foreground/50 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
