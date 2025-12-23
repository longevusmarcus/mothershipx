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
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Badge variant="default" className="text-[10px] sm:text-xs px-2 sm:px-3">Global</Badge>
            <Badge variant="outline" className="cursor-pointer text-[10px] sm:text-xs px-2 sm:px-3">Weekly</Badge>
            <Badge variant="outline" className="cursor-pointer text-[10px] sm:text-xs px-2 sm:px-3">Monthly</Badge>
          </div>
          <Button variant="outline" size="sm" className="text-xs h-8 px-2 sm:px-3">
            <Filter className="h-3.5 w-3.5 sm:mr-2" />
            <span className="hidden sm:inline">Filter by Problem</span>
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          </Button>
        </motion.div>

        {/* Top 3 Podium - Compact on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
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
                  className="relative overflow-hidden"
                >
                  {isFirst && (
                    <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
                  )}
                  <CardContent className={`relative z-10 p-2 sm:p-4 ${isFirst ? "pt-3 sm:pt-6 pb-3 sm:pb-6" : "pt-2 sm:pt-4 pb-2 sm:pb-4"}`}>
                    <div className="text-center space-y-1 sm:space-y-3">
                      {/* Avatar */}
                      <div className="relative inline-block">
                        <div
                          className={`rounded-full flex items-center justify-center font-bold mx-auto ${
                            isFirst
                              ? "h-10 w-10 sm:h-16 sm:w-16 text-sm sm:text-xl bg-gradient-primary text-primary-foreground"
                              : "h-8 w-8 sm:h-12 sm:w-12 text-xs sm:text-lg bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {builder.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 rounded-full flex items-center justify-center ${
                            isFirst
                              ? "h-5 w-5 sm:h-7 sm:w-7 bg-warning text-background"
                              : isSecond
                              ? "h-4 w-4 sm:h-6 sm:w-6 bg-muted-foreground/30 text-muted-foreground"
                              : "h-4 w-4 sm:h-6 sm:w-6 bg-warning/60 text-background"
                          }`}
                        >
                          {isFirst ? (
                            <Trophy className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                          ) : (
                            <Medal className="h-2 w-2 sm:h-3 sm:w-3" />
                          )}
                        </div>
                      </div>

                      {/* Name & Score */}
                      <div className="space-y-0">
                        <p className={`font-semibold truncate ${isFirst ? "text-xs sm:text-base" : "text-[10px] sm:text-sm"}`}>
                          {builder.name.split(' ')[0]}
                          <span className="hidden sm:inline"> {builder.name.split(' ')[1]}</span>
                        </p>
                        <p className={`font-bold text-gradient ${isFirst ? "text-lg sm:text-2xl" : "text-base sm:text-xl"}`}>
                          {builder.score.toLocaleString()}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">XP Points</p>
                      </div>

                      {/* Stats */}
                      <div className={`grid grid-cols-3 gap-0.5 sm:gap-1 text-center ${isFirst ? "text-[9px] sm:text-xs" : "text-[8px] sm:text-[10px]"}`}>
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
                        <Badge variant="success" className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                          <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
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
          <CardHeader className="py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-base">Rankings</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="space-y-1 sm:space-y-2">
              {leaderboardData.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-6 sm:w-8 text-center">
                    <span className="font-bold text-xs sm:text-base text-muted-foreground">{entry.rank}</span>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs sm:text-base shrink-0">
                    {entry.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-xs sm:text-base">{entry.name}</p>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                      <span>{entry.solutions} solns</span>
                      <span className="text-success">{entry.fitScore}%</span>
                    </div>
                  </div>
                  <div className="w-24 hidden md:block">
                    <Progress value={entry.fitScore} size="sm" indicatorColor="gradient" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs sm:text-base">{entry.score.toLocaleString()}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground">XP</p>
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
