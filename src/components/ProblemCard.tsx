import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, Clock, ArrowRight, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ProblemCardProps {
  id: string;
  title: string;
  category: string;
  sentiment: "high" | "medium" | "low";
  slotsTotal: number;
  slotsFilled: number;
  momentum: number;
  isLocked?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function ProblemCard({
  id,
  title,
  category,
  sentiment,
  slotsTotal,
  slotsFilled,
  momentum,
  isLocked = false,
  delay = 0,
  onClick,
}: ProblemCardProps) {
  const navigate = useNavigate();
  const slotsRemaining = slotsTotal - slotsFilled;
  const fillPercentage = (slotsFilled / slotsTotal) * 100;

  const sentimentColors = {
    high: "text-success",
    medium: "text-warning",
    low: "text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        variant={isLocked ? "default" : "interactive"}
        className={`relative overflow-hidden ${isLocked ? "opacity-60" : ""}`}
        onClick={isLocked ? undefined : () => { onClick?.(); navigate(`/problems/${id}`); }}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Dashboard Full</span>
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
            {slotsRemaining <= 5 && !isLocked && (
              <Badge variant="live" className="text-xs">
                {slotsRemaining} slots left
              </Badge>
            )}
          </div>
          <CardTitle className="text-base mt-2 leading-tight">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-medium">{slotsFilled}/{slotsTotal}</span>
            </div>
            <Progress value={fillPercentage} size="sm" indicatorColor={fillPercentage > 80 ? "warning" : "default"} />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp className={`h-3.5 w-3.5 ${sentimentColors[sentiment]}`} />
                <span className="text-muted-foreground">Sentiment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{slotsFilled} active</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-primary">+{momentum}%</span>
            </div>
          </div>

          {!isLocked && (
            <Button variant="ghost" size="sm" className="w-full justify-between mt-2">
              <span>Enter Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
