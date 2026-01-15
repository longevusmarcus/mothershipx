import { motion } from "framer-motion";
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Sparkles, 
  Users, 
  Rocket,
  Lock,
  Zap,
  Target,
  Crown,
  Flame,
  Timer,
  Gift,
  Swords
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WaitlistForm } from "@/components/WaitlistForm";
import { useWaitlistCount } from "@/hooks/useWaitlist";

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
];

const leagueFeatures = [
  {
    icon: Crown,
    title: "Global Rankings",
    description: "Compete globally and climb the tiers",
    stat: "6 Tiers",
  },
  {
    icon: Timer,
    title: "Seasonal Leagues",
    description: "Monthly seasons with fresh leaderboards",
    stat: "30 Days",
  },
  {
    icon: Trophy,
    title: "XP & Ranks",
    description: "Earn XP from Bronze to Diamond tier",
    stat: "6 Tiers",
  },
  {
    icon: Gift,
    title: "Prize Pool",
    description: "Win funding, distribution, and acceleration",
    stat: "$50K+ monthly",
  },
];

const LeaderboardPage = () => {
  const { data: waitlistCount = 0 } = useWaitlistCount("leaderboard");
  
  const getPodiumOrder = (index: number) => {
    const order = [1, 0, 2];
    return topBuilders[order[index]];
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
        {/* Mother League Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-warning/30 bg-gradient-to-br from-warning/5 via-background to-primary/5"
        >
          <div className="absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="relative z-10 p-6 sm:p-8 text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20"
            >
              <Trophy className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">League Coming Soon</span>
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl font-bold">
              Mother League 🏆
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Climb the global rankings, earn XP every season, and win prizes for being the top builders
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Badge variant="outline" className="gap-1 border-warning/30">
                <Crown className="h-3 w-3" />
                Global Rankings
              </Badge>
              <Badge variant="outline" className="gap-1 border-warning/30">
                <Flame className="h-3 w-3" />
                Seasonal Leagues
              </Badge>
              <Badge variant="outline" className="gap-1 border-warning/30">
                <Gift className="h-3 w-3" />
                Monthly Prizes
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* League Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {leagueFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className="h-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-4 space-y-3 relative">
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {feature.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {feature.stat}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Blurred Preview Section */}
        <div className="relative">
          {/* Blur Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-3 p-6"
            >
              <div className="h-14 w-14 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto">
                <Lock className="h-7 w-7 text-warning" />
              </div>
              <h3 className="text-lg font-semibold">Live Leaderboard</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Compete, earn XP, and climb from Bronze to Diamond tier
              </p>
              <WaitlistForm feature="leaderboard" buttonText="Join Waitlist" />
            </motion.div>
          </div>

          {/* Blurred Content Preview */}
          <div className="filter blur-[2px] pointer-events-none select-none opacity-60 space-y-4">
            {/* Top 3 Podium Preview */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
              {[0, 1, 2].map((displayIndex) => {
                const builder = getPodiumOrder(displayIndex);
                const isFirst = builder.rank === 1;

                return (
                  <Card 
                    key={builder.rank}
                    variant={isFirst ? "glow" : "elevated"} 
                    className="relative overflow-hidden"
                  >
                    <CardContent className={`relative z-10 p-2 sm:p-4 ${isFirst ? "pt-3 sm:pt-6 pb-3 sm:pb-6" : "pt-2 sm:pt-4 pb-2 sm:pb-4"}`}>
                      <div className="text-center space-y-1 sm:space-y-3">
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
                                : "h-4 w-4 sm:h-6 sm:w-6 bg-muted-foreground/30 text-muted-foreground"
                            }`}
                          >
                            {isFirst ? (
                              <Trophy className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                            ) : (
                              <Medal className="h-2 w-2 sm:h-3 sm:w-3" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-0">
                          <p className={`font-semibold truncate ${isFirst ? "text-xs sm:text-base" : "text-[10px] sm:text-sm"}`}>
                            {builder.name.split(' ')[0]}
                          </p>
                          <p className={`font-bold text-gradient ${isFirst ? "text-lg sm:text-2xl" : "text-base sm:text-xl"}`}>
                            {builder.score.toLocaleString()}
                          </p>
                          <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Leaderboard Table Preview */}
            <Card variant="elevated">
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-sm sm:text-base">Rankings</CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <div className="space-y-1 sm:space-y-2">
                  {leaderboardData.slice(0, 5).map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg"
                    >
                      <div className="w-6 sm:w-8 text-center">
                        <span className="font-bold text-xs sm:text-base text-muted-foreground">{entry.rank}</span>
                      </div>
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs sm:text-base shrink-0">
                        {entry.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-xs sm:text-base">{entry.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{entry.solutions} solutions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xs sm:text-base">{entry.score.toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground">XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6 space-y-3"
        >
          <p className="text-sm text-muted-foreground">
            Be the first to compete when the League opens
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {(3421 + waitlistCount).toLocaleString()} on waitlist
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Weekly prizes
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              $50K+ pool
            </span>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default LeaderboardPage;
