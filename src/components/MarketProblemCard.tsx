import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Eye, Bookmark, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import type { MarketProblem } from "@/data/marketIntelligence";

interface MarketProblemCardProps {
  problem: MarketProblem;
  delay?: number;
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

export function MarketProblemCard({ problem, delay = 0 }: MarketProblemCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const handleCardClick = () => {
    if (isAuthenticated) {
      navigate(`/problems/${problem.id}`);
    } else {
      setAuthOpen(true);
    }
  };

  const sentiment = getSentimentLabel(problem.sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div
        onClick={handleCardClick}
        className="rounded-lg border border-border bg-card p-4 cursor-pointer hover:border-foreground/20 transition-colors"
      >
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
        <h3 className="font-medium text-sm mb-1 line-clamp-2">
          {problem.title}
        </h3>
        
        {/* Subtitle */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {problem.subtitle}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {problem.views && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(problem.views)}
            </span>
          )}
          {problem.saves && (
            <span className="flex items-center gap-1">
              <Bookmark className="h-3 w-3" />
              {formatNumber(problem.saves)}
            </span>
          )}
          {problem.shares && (
            <span className="flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              {formatNumber(problem.shares)}
            </span>
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