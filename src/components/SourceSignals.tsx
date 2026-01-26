import { motion } from "framer-motion";
import type { TrendSignal, TrendSource } from "@/data/marketIntelligence";
import { getSourceLabel } from "@/data/marketIntelligence";
import { MetricSparkline } from "@/components/MetricSparkline";
import logoTiktok from "@/assets/logo-tiktok.png";
import logoGoogleTrends from "@/assets/logo-google-trends.png";
import logoReddit from "@/assets/logo-reddit.png";
import logoFreelancer from "@/assets/logo-freelancer.png";
import logoYoutube from "@/assets/logo-youtube.png";

interface SourceSignalsProps {
  sources: TrendSignal[];
  layout?: "horizontal" | "grid";
}

// Parse value string to number for sparkline
function parseMetricValue(value: string): number {
  const cleaned = value.replace(/[^0-9.KMB+]/gi, '');
  const numPart = parseFloat(cleaned.replace(/[KMB+]/gi, ''));
  
  if (cleaned.toUpperCase().includes('M')) return numPart * 1000000;
  if (cleaned.toUpperCase().includes('K')) return numPart * 1000;
  if (cleaned.toUpperCase().includes('B')) return numPart * 1000000000;
  
  return numPart || 0;
}

// Get source logo
function getSourceLogo(source: TrendSource): string | null {
  const logos: Partial<Record<TrendSource, string>> = {
    tiktok: logoTiktok,
    google_trends: logoGoogleTrends,
    reddit: logoReddit,
    freelancer: logoFreelancer,
  };
  return logos[source] || null;
}

export function SourceSignals({ sources, layout = "horizontal" }: SourceSignalsProps) {
  return (
    <div className={`flex ${layout === "grid" ? "flex-wrap" : "overflow-x-auto touch-scroll"} gap-3`}>
      {sources.map((signal, index) => {
        const numericValue = parseMetricValue(signal.value);
        const logo = getSourceLogo(signal.source);
        const isPositive = signal.change > 0;
        
        return (
          <motion.div
            key={`${signal.source}-${signal.metric}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 p-4 rounded-lg border border-border/50 bg-background min-w-[160px] relative overflow-hidden"
          >
            {/* Header: Logo + Change */}
            <div className="flex items-center justify-between gap-3 mb-3">
              {logo ? (
                <div className="w-8 h-8 rounded-md bg-muted/30 flex items-center justify-center">
                  <img 
                    src={logo} 
                    alt={getSourceLabel(signal.source)} 
                    className="w-5 h-5 object-contain opacity-70"
                  />
                </div>
              ) : (
                <span className="text-lg">{signal.icon}</span>
              )}
              <span className={`text-xs font-medium tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}>
                {isPositive ? "+" : ""}{signal.change}%
              </span>
            </div>
            
            {/* Value */}
            <p className="text-xl font-semibold tabular-nums tracking-tight">{signal.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{signal.metric}</p>
            
            {/* Sparkline Chart */}
            <div className="mt-3 -mx-1">
              <MetricSparkline 
                currentValue={numericValue}
                changePercent={signal.change}
                color={isPositive ? "success" : "destructive"}
                height={36}
                dataPoints={14}
              />
            </div>
            
            {/* Source Label */}
            <p className="text-[10px] text-muted-foreground/60 mt-2 uppercase tracking-wider font-medium">
              {getSourceLabel(signal.source)}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
