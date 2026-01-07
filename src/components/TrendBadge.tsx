import { motion } from "framer-motion";
import { Flame, TrendingUp, ArrowRight, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrendSentiment } from "@/data/marketIntelligence";

interface TrendBadgeProps {
  sentiment: TrendSentiment;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  animated?: boolean;
}

export function TrendBadge({ 
  sentiment, 
  size = "md", 
  showIcon = true,
  animated = false 
}: TrendBadgeProps) {
  const config = {
    exploding: {
      icon: Flame,
      label: "Exploding",
      className: "bg-gradient-to-r from-orange-500 to-red-500 text-white border-0",
      iconColor: "text-white",
    },
    rising: {
      icon: TrendingUp,
      label: "Rising",
      className: "bg-success/20 text-success border-success/30",
      iconColor: "text-success",
    },
    stable: {
      icon: ArrowRight,
      label: "Stable",
      className: "bg-warning/20 text-warning border-warning/30",
      iconColor: "text-warning",
    },
    declining: {
      icon: ArrowDown,
      label: "Declining",
      className: "bg-muted text-muted-foreground border-border",
      iconColor: "text-muted-foreground",
    },
  };

  const { icon: Icon, label, className, iconColor } = config[sentiment];

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const content = (
    <Badge 
      variant="outline" 
      className={`${className} ${sizeClasses[size]} font-semibold gap-1`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} ${iconColor}`} />}
      {label}
    </Badge>
  );

  if (animated && sentiment === "exploding") {
    return (
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
