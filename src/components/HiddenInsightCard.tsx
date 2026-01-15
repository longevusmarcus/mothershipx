import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { HiddenInsight } from "@/data/marketIntelligence";

interface HiddenInsightCardProps {
  insight: HiddenInsight;
}

export function HiddenInsightCard({ insight }: HiddenInsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <h3 className="font-serif text-lg">Hidden Signal</h3>
      
      <div className="space-y-3">
        {/* Surface Ask */}
        <div className="p-4 rounded-lg border border-border/50 bg-secondary/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">What they say</p>
          <p className="text-sm italic text-foreground/80">"{insight.surfaceAsk}"</p>
        </div>
        
        <div className="flex justify-center">
          <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
        </div>
        
        {/* Real Problem */}
        <div className="p-4 rounded-lg border border-border bg-background">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">What they mean</p>
          <p className="text-sm font-medium">"{insight.realProblem}"</p>
        </div>
      </div>
      
      {/* Strategic Insight */}
      <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Strategic Insight</p>
        <p className="text-sm text-foreground/90">{insight.hiddenSignal}</p>
      </div>
    </motion.div>
  );
}
