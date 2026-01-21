import { motion } from "framer-motion";
import { ArrowDown, Lightbulb } from "lucide-react";
import type { HiddenInsight } from "@/data/marketIntelligence";

interface HiddenInsightCardProps {
  insight?: HiddenInsight | null;
}

// Detect template/dummy insights that should be filtered out
function isDummyInsight(insight: HiddenInsight): boolean {
  if (!insight.surfaceAsk || !insight.realProblem || !insight.hiddenSignal) {
    return true;
  }
  
  // Common template patterns to filter
  const dummyPatterns = [
    /how do i solve .+ issues\?/i,
    /what's the best .+ solution\?/i,
    /i need help with/i,
    /users feel overwhelmed by existing solutions/i,
    /the emotional burden of .+ is underestimated/i,
    /people seek validation, not just solutions/i,
    /market gap exists for human-centered/i,
    /community-driven solutions outperform/i,
    /simplification is the new premium feature/i,
  ];
  
  const allText = `${insight.surfaceAsk} ${insight.realProblem} ${insight.hiddenSignal}`;
  return dummyPatterns.some(pattern => pattern.test(allText));
}

export function HiddenInsightCard({ insight }: HiddenInsightCardProps) {
  // Show empty state if no insight data or if it's dummy/template data
  if (!insight || !insight.surfaceAsk || isDummyInsight(insight)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="font-serif text-lg">Hidden Signal</h3>
        <div className="p-6 rounded-lg border border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            Hidden signal analysis coming soon
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            AI is processing deeper insights for this problem
          </p>
        </div>
      </motion.div>
    );
  }

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
