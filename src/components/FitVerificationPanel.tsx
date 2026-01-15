import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface FitVerificationPanelProps {
  sentimentFitScore: number;
  problemCoverage: number;
  adoptionVelocity: number;
  revenuePresent: boolean;
  revenueAmount?: string;
  buildMomentum: number;
  misalignments: string[];
}

export function FitVerificationPanel({
  sentimentFitScore,
  problemCoverage,
  adoptionVelocity,
  revenuePresent,
  revenueAmount,
  buildMomentum,
  misalignments,
}: FitVerificationPanelProps) {
  const overallScore = Math.round((sentimentFitScore + problemCoverage + buildMomentum) / 3);

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 rounded-lg border border-border/50 bg-background space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg">Problem-Solution Fit</h3>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered verification</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{overallScore}%</p>
          <p className="text-xs text-muted-foreground">{getScoreLabel(overallScore)}</p>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sentiment Fit</span>
            <span className="text-sm font-semibold">{sentimentFitScore}%</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sentimentFitScore}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-foreground rounded-full"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Semantic alignment with pain points</p>
        </div>

        <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Problem Coverage</span>
            <span className="text-sm font-semibold">{problemCoverage}%</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${problemCoverage}%` }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full bg-foreground rounded-full"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">How much of the problem is addressed</p>
        </div>
      </div>

      {/* Quantitative Signals */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Quantitative Signals</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-secondary/20 text-center">
            <p className="text-lg font-semibold">{adoptionVelocity}</p>
            <p className="text-[10px] text-muted-foreground">Users/week</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/20 text-center">
            <p className="text-lg font-semibold">{revenuePresent ? revenueAmount : "—"}</p>
            <p className="text-[10px] text-muted-foreground">{revenuePresent ? "Revenue" : "No revenue"}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/20 text-center">
            <p className="text-lg font-semibold">{buildMomentum}%</p>
            <p className="text-[10px] text-muted-foreground">Build momentum</p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {misalignments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" />
            Misalignment Warnings
          </p>
          <div className="space-y-1.5">
            {misalignments.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-warning/5 border border-warning/20"
              >
                <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{warning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {overallScore >= 60 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Strong Fit Detected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your solution shows strong alignment with the identified pain points.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
