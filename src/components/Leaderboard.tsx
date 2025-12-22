import { motion } from "framer-motion";
import { Trophy, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  change: "up" | "down" | "same";
  problem: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
}

export function Leaderboard({ entries, title = "Top Builders" }: LeaderboardProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-primary text-primary-foreground";
      case 2:
        return "bg-secondary text-secondary-foreground";
      case 3:
        return "bg-secondary/50 text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getChangeIcon = (change: "up" | "down" | "same") => {
    switch (change) {
      case "up":
        return <ArrowUp className="h-3 w-3 text-success" />;
      case "down":
        return <ArrowDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${getRankStyle(entry.rank)}`}
            >
              {entry.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.name}</p>
              <p className="text-xs text-muted-foreground truncate">{entry.problem}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{entry.score}</span>
              </div>
              {getChangeIcon(entry.change)}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
