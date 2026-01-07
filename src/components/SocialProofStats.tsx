import { motion } from "framer-motion";
import { Eye, Bookmark, Share2, Trophy } from "lucide-react";
import { formatViews } from "@/data/marketIntelligence";

interface SocialProofStatsProps {
  views: number;
  saves: number;
  shares: number;
  trendingRank?: number;
  isViral?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "grid";
}

export function SocialProofStats({
  views,
  saves,
  shares,
  trendingRank,
  isViral,
  size = "md",
  layout = "horizontal",
}: SocialProofStatsProps) {
  const stats = [
    { icon: Eye, value: views, label: "Views", color: "text-primary" },
    { icon: Bookmark, value: saves, label: "Saves", color: "text-success" },
    { icon: Share2, value: shares, label: "Shares", color: "text-warning" },
  ];

  const sizeClasses = {
    sm: { icon: "h-3 w-3", value: "text-xs", label: "text-[10px]" },
    md: { icon: "h-4 w-4", value: "text-sm", label: "text-xs" },
    lg: { icon: "h-5 w-5", value: "text-base", label: "text-sm" },
  };

  return (
    <div className={`flex ${layout === "grid" ? "flex-wrap gap-3" : "items-center gap-4"}`}>
      {trendingRank && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`flex items-center gap-1 ${isViral ? "text-destructive" : "text-primary"}`}
        >
          <Trophy className={sizeClasses[size].icon} />
          <span className={`font-bold ${sizeClasses[size].value}`}>#{trendingRank}</span>
        </motion.div>
      )}
      
      {stats.map(({ icon: Icon, value, label, color }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-1.5"
        >
          <Icon className={`${sizeClasses[size].icon} ${color}`} />
          <span className={`font-semibold ${sizeClasses[size].value}`}>
            {formatViews(value)}
          </span>
          <span className={`text-muted-foreground ${sizeClasses[size].label} hidden sm:inline`}>
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
