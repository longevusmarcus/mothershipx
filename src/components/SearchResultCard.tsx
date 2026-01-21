import { motion } from "framer-motion";
import { TrendingUp, Eye, Bookmark, Share2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  sentiment: "exploding" | "rising" | "stable" | "declining";
  views: number;
  saves: number;
  shares: number;
  painPoints: string[];
  sources?: { source: string; metric: string; value: string }[];
  isViral: boolean;
  opportunityScore: number;
  addedToLibrary?: boolean;
  rank?: number;
}

interface SearchResultCardProps {
  result: SearchResult;
  delay?: number;
  isLatest?: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

const getSentimentStyle = (sentiment: string) => {
  switch (sentiment) {
    case "exploding":
      return { label: "Exploding", className: "text-destructive bg-destructive/10" };
    case "rising":
      return { label: "Rising", className: "text-success bg-success/10" };
    case "stable":
      return { label: "Stable", className: "text-muted-foreground bg-muted" };
    default:
      return { label: "Declining", className: "text-muted-foreground bg-muted" };
  }
};

export function SearchResultCard({ result, delay = 0, isLatest = false }: SearchResultCardProps) {
  const sentiment = getSentimentStyle(result.sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="w-full max-w-xl"
    >
      <div
        className={cn(
          "rounded-xl border bg-card p-5 transition-all",
          isLatest ? "border-primary/50 shadow-glow" : "border-border",
          result.isViral && "ring-1 ring-primary/20"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {result.category}
            </Badge>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", sentiment.className)}>
              {sentiment.label}
            </span>
            {result.isViral && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Viral
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="font-medium">{result.opportunityScore}%</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="font-medium text-sm mb-1">{result.title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{result.subtitle}</p>

        {/* Pain Points */}
        {result.painPoints.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Pain Points Detected:</p>
            <div className="space-y-1.5">
              {result.painPoints.slice(0, 3).map((point, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <AlertCircle className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatNumber(result.views)}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="h-3 w-3" />
            {formatNumber(result.saves)}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            {formatNumber(result.shares)}
          </span>
        </div>

        {/* Sources */}
        {result.sources && result.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {result.sources.map((source, i) => (
              <div key={i} className="text-xs px-2 py-1 bg-secondary/50 rounded-md">
                <span className="text-muted-foreground">{source.source}:</span>{" "}
                <span className="font-medium">{source.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Library Status */}
        {result.addedToLibrary && (
          <div className="flex items-center gap-2 text-xs text-success pt-2 border-t border-border">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Added to Library</span>
          </div>
        )}
        
        {result.isViral && !result.addedToLibrary && (
          <div className="flex items-center gap-2 text-xs text-primary pt-2 border-t border-border">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Meets virality criteria - Adding to Library...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
