import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HiddenInsight } from "@/data/marketIntelligence";

interface HiddenInsightCardProps {
  insight: HiddenInsight;
}

export function HiddenInsightCard({ insight }: HiddenInsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card variant="glow" className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-glow" />
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            Hidden Signal
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          {/* Surface Ask → Real Problem */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">💬</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">What they say</p>
                <p className="text-sm italic">"{insight.surfaceAsk}"</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">🎯</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">What they mean</p>
                <p className="text-sm font-medium">"{insight.realProblem}"</p>
              </div>
            </div>
          </div>
          
          {/* Hidden Signal */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-primary mb-1">Strategic Insight</p>
              <p className="text-sm">{insight.hiddenSignal}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
