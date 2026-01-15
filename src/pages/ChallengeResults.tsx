import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  User,
  Users,
  Clock,
  ArrowLeft,
  ExternalLink,
  Github,
  Star,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChallenge } from "@/hooks/useChallenges";
import { useRankings } from "@/hooks/useRankings";
import { cn } from "@/lib/utils";

const ChallengeResults = () => {
  const { id } = useParams<{ id: string }>();
  const { data: challenge, isLoading: loadingChallenge } = useChallenge(id || "");
  const { data: rankings = [], isLoading: loadingRankings } = useRankings(id);

  if (loadingChallenge || loadingRankings) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!challenge) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold mb-2">Challenge not found</h2>
          <p className="text-muted-foreground mb-4">
            This challenge may have been removed or doesn't exist.
          </p>
          <Link to="/challenges">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Arena
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-warning" />;
      case 2:
        return <Medal className="h-5 w-5 text-[#C0C0C0]" />;
      case 3:
        return <Medal className="h-5 w-5 text-[#CD7F32]" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-warning/20 via-warning/10 to-transparent border-warning/50";
      case 2:
        return "bg-gradient-to-r from-[#C0C0C0]/20 via-[#C0C0C0]/10 to-transparent border-[#C0C0C0]/50";
      case 3:
        return "bg-gradient-to-r from-[#CD7F32]/20 via-[#CD7F32]/10 to-transparent border-[#CD7F32]/50";
      default:
        return "bg-card border-border";
    }
  };

  return (
    <AppLayout>
      <SEO
        title={`Results: ${challenge.title}`}
        description={`View the results and winners of the ${challenge.title} challenge.`}
      />

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/challenges"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Arena
        </Link>

        {/* Challenge Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Completed
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold mb-1">{challenge.title}</h1>
                  <p className="text-muted-foreground">{challenge.description}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-2xl font-bold text-success">
                    <DollarSign className="h-6 w-6" />
                    {challenge.prizePool}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Prize Pool</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{challenge.participants} participants</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{challenge.soloParticipants} solo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{challenge.teamCount} teams</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>Trend: {challenge.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Final Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rankings.length > 0 ? (
                <div className="space-y-3">
                  {rankings.map((ranking, index) => (
                    <motion.div
                      key={ranking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all",
                        getRankBg(ranking.rank)
                      )}
                    >
                      {/* Rank */}
                      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                        {getRankIcon(ranking.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {ranking.submission?.product_name || "Submission"}
                          </p>
                          {ranking.is_winner && (
                            <Badge className="bg-warning/10 text-warning border-warning/30 text-[10px]">
                              Winner
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Score: {ranking.total_score?.toFixed(1) || 0} pts
                        </p>
                      </div>

                      {/* Score Breakdown */}
                      <div className="hidden sm:flex items-center gap-4 text-xs">
                        {ranking.github_score != null && (
                          <div className="flex items-center gap-1">
                            <Github className="h-3 w-3" />
                            <span>{ranking.github_score}</span>
                          </div>
                        )}
                        {ranking.sentiment_fit_score != null && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>{ranking.sentiment_fit_score}</span>
                          </div>
                        )}
                      </div>

                      {/* Prize */}
                      {ranking.prize_won != null && ranking.prize_won > 0 && (
                        <div className="text-right">
                          <p className="text-success font-bold">${ranking.prize_won}</p>
                          <p className="text-[10px] text-muted-foreground">won</p>
                        </div>
                      )}

                      {/* Link to Demo */}
                      {ranking.submission?.product_url && (
                        <a
                          href={ranking.submission.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    No rankings available yet. Results will be posted soon!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ChallengeResults;
