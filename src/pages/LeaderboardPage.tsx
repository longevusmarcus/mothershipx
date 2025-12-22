import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp, Filter, ChevronDown } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const topBuilders = [
  {
    rank: 1,
    name: "Alex Chen",
    avatar: "A",
    score: 2892,
    solutions: 8,
    fitScore: 94,
    change: "+3",
    streak: 12,
  },
  {
    rank: 2,
    name: "Sarah Kim",
    avatar: "S",
    score: 2647,
    solutions: 6,
    fitScore: 91,
    change: "+1",
    streak: 8,
  },
  {
    rank: 3,
    name: "Mike Johnson",
    avatar: "M",
    score: 2523,
    solutions: 7,
    fitScore: 88,
    change: "-2",
    streak: 5,
  },
];

const leaderboardData = [
  { rank: 4, name: "Emma Davis", score: 2156, solutions: 5, fitScore: 85 },
  { rank: 5, name: "James Wilson", score: 1998, solutions: 4, fitScore: 82 },
  { rank: 6, name: "Lisa Anderson", score: 1847, solutions: 4, fitScore: 80 },
  { rank: 7, name: "David Brown", score: 1723, solutions: 3, fitScore: 78 },
  { rank: 8, name: "Maria Garcia", score: 1654, solutions: 3, fitScore: 76 },
  { rank: 9, name: "Robert Taylor", score: 1589, solutions: 3, fitScore: 74 },
  { rank: 10, name: "Jennifer Lee", score: 1456, solutions: 2, fitScore: 72 },
];

const LeaderboardPage = () => {
  const getPodiumOrder = (index: number) => {
    // Display order: 2nd place, 1st place, 3rd place
    const order = [1, 0, 2];
    return topBuilders[order[index]];
  };

  return (
    <AppLayout title="Leaderboard">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Badge variant="default">Global</Badge>
            <Badge variant="outline" className="cursor-pointer">Weekly</Badge>
            <Badge variant="outline" className="cursor-pointer">Monthly</Badge>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter by Problem
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 items-end">
          {[0, 1, 2].map((displayIndex) => {
            const builder = getPodiumOrder(displayIndex);
            const isFirst = builder.rank === 1;
            const isSecond = builder.rank === 2;
            const isThird = builder.rank === 3;

            return (
              <motion.div
                key={builder.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: displayIndex * 0.15 }}
              >
                <Card 
                  variant={isFirst ? "glow" : "elevated"} 
                  className={`relative overflow-hidden ${isFirst ? "pb-2" : isSecond ? "pb-0" : "pb-0"}`}
                >
                  {isFirst && (
                    <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
                  )}
                  <CardContent className={`pt-6 relative z-10 ${isFirst ? "pb-6" : "pb-4"}`}>
                    <div className="text-center space-y-3">
                      <div className="relative inline-block">
                        <div
                          className={`rounded-full flex items-center justify-center font-bold mx-auto ${
                            isFirst
                              ? "h-16 w-16 text-xl bg-gradient-primary text-primary-foreground"
                              : "h-12 w-12 text-lg bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {builder.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 rounded-full flex items-center justify-center ${
                            isFirst
                              ? "h-7 w-7 bg-warning text-background"
                              : isSecond
                              ? "h-6 w-6 bg-muted-foreground/30 text-muted-foreground"
                              : "h-6 w-6 bg-warning/60 text-background"
                          }`}
                        >
                          {isFirst ? (
                            <Trophy className="h-3.5 w-3.5" />
                          ) : (
                            <Medal className="h-3 w-3" />
                          )}
                        </div>
                      </div>

                      <div>
                        <p className={`font-semibold ${isFirst ? "text-base" : "text-sm"}`}>{builder.name}</p>
                        <p className={`font-bold text-gradient ${isFirst ? "text-2xl" : "text-xl"}`}>
                          {builder.score.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP Points</p>
                      </div>

                      <div className={`grid grid-cols-3 gap-1 text-center ${isFirst ? "text-xs" : "text-[10px]"}`}>
                        <div>
                          <p className="font-bold">{builder.solutions}</p>
                          <p className="text-muted-foreground">Solns</p>
                        </div>
                        <div>
                          <p className="font-bold text-success">{builder.fitScore}%</p>
                          <p className="text-muted-foreground">Fit</p>
                        </div>
                        <div>
                          <p className="font-bold">{builder.streak}</p>
                          <p className="text-muted-foreground">Streak</p>
                        </div>
                      </div>

                      {isFirst && (
                        <Badge variant="success" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {builder.change} this week
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Leaderboard Table */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboardData.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 text-center">
                    <span className="font-bold text-muted-foreground">{entry.rank}</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                    {entry.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{entry.solutions} solutions</span>
                      <span>{entry.fitScore}% fit</span>
                    </div>
                  </div>
                  <div className="w-32 hidden md:block">
                    <Progress value={entry.fitScore} size="sm" indicatorColor="gradient" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaderboardPage;
