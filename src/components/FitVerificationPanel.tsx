import { motion } from "framer-motion";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Users,
  DollarSign,
  GitBranch,
  Gauge,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <Card variant="glow" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />
      
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Problem-Solution Fit</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">AI-powered verification</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}%</p>
            <Badge variant={overallScore >= 60 ? "success" : "warning"} className="text-xs">
              {getScoreLabel(overallScore)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Core AI Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-secondary/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sentiment Fit</span>
              </div>
              <span className={`text-lg font-bold ${getScoreColor(sentimentFitScore)}`}>
                {sentimentFitScore}%
              </span>
            </div>
            <Progress value={sentimentFitScore} size="sm" indicatorColor={sentimentFitScore >= 60 ? "success" : "default"} />
            <p className="text-xs text-muted-foreground">
              Semantic alignment with pain points
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg bg-secondary/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Problem Coverage</span>
              </div>
              <span className={`text-lg font-bold ${getScoreColor(problemCoverage)}`}>
                {problemCoverage}%
              </span>
            </div>
            <Progress value={problemCoverage} size="sm" indicatorColor={problemCoverage >= 60 ? "success" : "default"} />
            <p className="text-xs text-muted-foreground">
              How much of the problem is addressed
            </p>
          </motion.div>
        </div>

        {/* Quantitative Signals */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Quantitative Signals
          </h4>
          
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-3 rounded-lg bg-secondary/30 text-center"
            >
              <Users className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold">{adoptionVelocity}</p>
              <p className="text-[10px] text-muted-foreground">Users/week</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-3 rounded-lg bg-secondary/30 text-center"
            >
              <DollarSign className={`h-4 w-4 mx-auto mb-1 ${revenuePresent ? 'text-success' : 'text-muted-foreground'}`} />
              <p className="text-lg font-bold">{revenuePresent ? revenueAmount : "—"}</p>
              <p className="text-[10px] text-muted-foreground">{revenuePresent ? "Revenue" : "No revenue"}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="p-3 rounded-lg bg-secondary/30 text-center"
            >
              <GitBranch className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold">{buildMomentum}%</p>
              <p className="text-[10px] text-muted-foreground">Build momentum</p>
            </motion.div>
          </div>
        </div>

        {/* Misalignment Warnings */}
        {misalignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              Misalignment Warnings
            </h4>
            <div className="space-y-2">
              {misalignments.map((warning, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">{warning}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Strengths */}
        {overallScore >= 60 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20"
          >
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-success">Strong Fit Detected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your solution shows strong alignment with the identified pain points.
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
