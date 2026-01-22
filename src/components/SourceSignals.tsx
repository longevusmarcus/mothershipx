import { motion } from "framer-motion";
import type { TrendSignal } from "@/data/marketIntelligence";
import { getSourceLabel } from "@/data/marketIntelligence";

interface SourceSignalsProps {
  sources: TrendSignal[];
  layout?: "horizontal" | "grid";
}

export function SourceSignals({ sources, layout = "horizontal" }: SourceSignalsProps) {
  return (
    <div className={`flex ${layout === "grid" ? "flex-wrap" : "overflow-x-auto touch-scroll"} gap-3`}>
      {sources.map((signal, index) => (
        <motion.div
          key={`${signal.source}-${signal.metric}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex-shrink-0 p-4 rounded-lg border border-border/50 bg-background min-w-[140px]"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-lg">{signal.icon}</span>
            <span className={`text-xs font-medium ${signal.change > 0 ? "text-success" : "text-destructive"}`}>
              {signal.change > 0 ? "+" : ""}{signal.change}%
            </span>
          </div>
          <p className="text-lg font-semibold">{signal.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{signal.metric}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-2 uppercase tracking-wide">
            {getSourceLabel(signal.source)}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
