import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Eye, Bookmark, Share2, Trash2, ArrowUp, MessageSquare, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useDeleteProblem } from "@/hooks/useDeleteProblem";
import type { MarketProblem } from "@/data/marketIntelligence";

interface MarketProblemCardProps {
  problem: MarketProblem;
  delay?: number;
  isPinned?: boolean;
  onTogglePin?: (problemId: string) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

const getSentimentLabel = (sentiment: string): { label: string; className: string } => {
  switch (sentiment) {
    case "exploding":
      return { label: "Exploding", className: "text-destructive" };
    case "rising":
      return { label: "Rising", className: "text-success" };
    case "stable":
      return { label: "Stable", className: "text-muted-foreground" };
    default:
      return { label: "Declining", className: "text-muted-foreground" };
  }
};

// Detect source type from problem sources
const detectSourceType = (problem: MarketProblem): "reddit" | "youtube" | "tiktok" | "default" => {
  if (!problem.sources || problem.sources.length === 0) return "default";
  
  // Check if this is a Reddit-only problem (all sources are reddit or has 'name' key = 'reddit')
  const allReddit = problem.sources.every(s => {
    const sourceName = (s?.source || (s as any)?.name || "").toLowerCase();
    return sourceName === "reddit";
  });
  const hasRedditNameFormat = problem.sources.some((s: any) => s.name === 'reddit');
  
  if (allReddit || hasRedditNameFormat) return "reddit";
  
  // Otherwise check first source for primary type
  const firstSource = problem.sources[0];
  const sourceName = (firstSource?.source || (firstSource as any)?.name || "").toLowerCase();
  if (sourceName === "youtube") return "youtube";
  if (sourceName === "tiktok") return "tiktok";
  return "default";
};

export function MarketProblemCard({ problem, delay = 0, isPinned = false, onTogglePin }: MarketProblemCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useSubscription();
  const deleteProblem = useDeleteProblem();
  const [authOpen, setAuthOpen] = useState(false);

  const handleCardClick = () => {
    if (isAuthenticated) {
      navigate(`/problems/${problem.id}`);
    } else {
      setAuthOpen(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remove this problem from the library?")) {
      deleteProblem.mutate(problem.id);
    }
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin?.(problem.id);
  };

  const sentiment = getSentimentLabel(problem.sentiment);
  const sourceType = detectSourceType(problem);

  // Determine card size variation for Pinterest effect
  const cardVariant = problem.id.charCodeAt(0) % 3; // 0, 1, or 2
  const subtitleLines = cardVariant === 0 ? "line-clamp-2" : cardVariant === 1 ? "line-clamp-3" : "line-clamp-4";
  const showPainPoints = cardVariant === 2 && problem.painPoints && problem.painPoints.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="cursor-grab active:cursor-grabbing"
    >
      <div
        onClick={handleCardClick}
        className={`relative rounded-xl border bg-card p-4 cursor-pointer hover:border-foreground/20 hover:shadow-lg transition-all duration-200 group ${isPinned ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'}`}
      >
        {/* Pin button */}
        {isAuthenticated && onTogglePin && (
          <button
            onClick={handleTogglePin}
            className={`absolute top-2 right-2 p-1.5 rounded-md transition-all z-10 ${isPinned ? 'text-primary bg-primary/10' : 'opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
            title={isPinned ? "Unpin card" : "Pin to top"}
          >
            <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
          </button>
        )}
        
        {/* Admin delete button */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleteProblem.isPending}
            className={`absolute top-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all z-10 ${isAuthenticated && onTogglePin ? 'right-10' : 'right-2'}`}
            title="Remove from library"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Top Row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">{problem.category}</span>
          <span className={`text-xs font-medium ${sentiment.className}`}>
            {sentiment.label}
          </span>
          {problem.trendingRank && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              #{problem.trendingRank}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm mb-2 line-clamp-2">
          {problem.title}
        </h3>
        
        {/* Subtitle - variable height for masonry */}
        <p className={`text-xs text-muted-foreground ${subtitleLines} mb-3`}>
          {problem.subtitle}
        </p>

        {/* Pain Points - shown on larger cards */}
        {showPainPoints && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {problem.painPoints?.slice(0, 3).map((point, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {point.length > 20 ? point.slice(0, 20) + "..." : point}
              </span>
            ))}
          </div>
        )}

        {/* Stats Row - source-specific */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {sourceType === "reddit" ? (
            <>
              {problem.views > 0 && (
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  {formatNumber(problem.views)} upvotes
                </span>
              )}
              {problem.shares > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {formatNumber(problem.shares)} comments
                </span>
              )}
            </>
          ) : sourceType === "youtube" ? (
            <>
              {problem.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(problem.views)} views
                </span>
              )}
              {problem.saves > 0 && (
                <span className="flex items-center gap-1">
                  <Bookmark className="h-3 w-3" />
                  {formatNumber(problem.saves)} likes
                </span>
              )}
              {problem.shares > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {formatNumber(problem.shares)} comments
                </span>
              )}
            </>
          ) : (
            <>
              {problem.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(problem.views)}
                </span>
              )}
              {problem.saves > 0 && (
                <span className="flex items-center gap-1">
                  <Bookmark className="h-3 w-3" />
                  {formatNumber(problem.saves)}
                </span>
              )}
              {problem.shares > 0 && (
                <span className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  {formatNumber(problem.shares)}
                </span>
              )}
            </>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Explore opportunity</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => navigate(`/problems/${problem.id}`)}
      />
    </motion.div>
  );
}