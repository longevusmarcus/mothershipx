import { motion } from "framer-motion";
import { Zap, Target, Users, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-green-500 to-emerald-400";
    if (score >= 70) return "from-yellow-500 to-orange-400";
    return "from-orange-500 to-red-400";
  };

  if (size === "compact") {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${getScoreColor(score)} flex items-center justify-center`}>
          <span className="text-xs font-bold text-white">{score}</span>
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Main Score */}
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getScoreColor(score)} flex items-center justify-center shadow-lg`}
        >
          <span className="text-2xl font-bold text-white">{score}</span>
        </motion.div>
        <div>
          <p className="text-sm text-muted-foreground">Opportunity Score</p>
          <p className="text-lg font-semibold">
            {score >= 85 ? "🔥 High Potential" : score >= 70 ? "📈 Promising" : "⚡ Emerging"}
          </p>
        </div>
      </div>

      {/* Metric Bars */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Target className="h-3 w-3" />
              Market Size
            </span>
            <span className="font-semibold">{marketSize}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Demand Velocity
            </span>
            <span className="font-semibold text-success">+{demandVelocity}%</span>
          </div>
          <Progress value={Math.min(demandVelocity, 100)} size="sm" indicatorColor="default" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3 w-3" />
              Competition Gap
            </span>
            <span className="font-semibold">{competitionGap}%</span>
          </div>
          <Progress 
            value={competitionGap} 
            size="sm" 
            indicatorColor={competitionGap > 70 ? "default" : competitionGap > 50 ? "warning" : "default"} 
          />
        </div>
      </div>
    </motion.div>
  );
}
