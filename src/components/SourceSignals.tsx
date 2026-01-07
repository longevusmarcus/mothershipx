import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrendSignal } from "@/data/marketIntelligence";
import { getSourceLabel } from "@/data/marketIntelligence";

interface SourceSignalsProps {
  sources: TrendSignal[];
  layout?: "horizontal" | "grid";
}

export function SourceSignals({ sources, layout = "horizontal" }: SourceSignalsProps) {
  const getSourceGradient = (source: string) => {
    const gradients: Record<string, string> = {
      tiktok: "from-pink-500 to-purple-600",
      google_trends: "from-blue-500 to-green-500",
      freelancer: "from-blue-600 to-blue-400",
      reddit: "from-orange-500 to-red-500",
      hackernews: "from-orange-400 to-orange-600",
    };
    return gradients[source] || "from-primary to-primary";
  };

  return (
    <div className={`flex ${layout === "grid" ? "flex-wrap" : "overflow-x-auto touch-scroll"} gap-3`}>
      {sources.map((signal, index) => (
        <motion.div
          key={signal.source}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex-shrink-0"
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${getSourceGradient(signal.source)}`} />
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{signal.icon}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {getSourceLabel(signal.source)}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] ${signal.change > 0 ? "text-success border-success/30" : "text-destructive border-destructive/30"}`}
                >
                  {signal.change > 0 ? "+" : ""}{signal.change}%
                </Badge>
              </div>
              <div>
                <p className="text-lg font-bold">{signal.value}</p>
                <p className="text-xs text-muted-foreground">{signal.metric}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
