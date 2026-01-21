import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Clock,
  Zap,
  Vote,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Loader2,
  Calendar,
  ExternalLink,
  LogOut,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyChallengeJoins, useLeaveChallenge } from "@/hooks/useChallengeJoins";
import { useChallenges } from "@/hooks/useChallenges";
import { getTimeRemaining } from "@/data/challengesData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ArenaHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myChallengeJoins = [], isLoading: joinsLoading } = useMyChallengeJoins();
  const { data: allChallenges = [], isLoading: challengesLoading } = useChallenges();
  const leaveChallengeMutation = useLeaveChallenge();

  // Fetch user's submissions for permanent links
  const { data: mySubmissions = [] } = useQuery({
    queryKey: ["my_submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("submissions")
        .select("id, challenge_id, product_name, product_url, demo_url, github_repo, status, total_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching submissions:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Fetch rankings to show wins
  const { data: myRankings = [] } = useQuery({
    queryKey: ["my_rankings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("rankings")
        .select("id, challenge_id, rank, is_winner, prize_won, total_score")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching rankings:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  const isLoading = joinsLoading || challengesLoading;

  // Map joined challenges with their details, submissions, and rankings
  const myArenaHistory = myChallengeJoins
    .map((join) => {
      const challenge = allChallenges.find((c) => c.id === join.challenge_id);
      if (!challenge) return null;
      
      const submission = mySubmissions.find((s) => s.challenge_id === join.challenge_id);
      const ranking = myRankings.find((r) => r.challenge_id === join.challenge_id);
      
      return {
        ...join,
        challenge,
        submission,
        ranking,
      };
    })
    .filter(Boolean);

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      await leaveChallengeMutation.mutateAsync(challengeId);
      toast.success("Left challenge successfully");
    } catch (error) {
      toast.error("Failed to leave challenge");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="text-[10px] gap-1 bg-success/10 text-success border-success/30">
            <Zap className="h-3 w-3" />
            Active
          </Badge>
        );
      case "voting":
        return (
          <Badge variant="outline" className="text-[10px] gap-1 bg-warning/10 text-warning border-warning/30">
            <Vote className="h-3 w-3" />
            Voting
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-[10px] gap-1 bg-muted text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="py-3 sm:py-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Arena History
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Arena History
            {myArenaHistory.length > 0 && (
              <Badge variant="secondary" className="text-[10px] ml-1">
                {myArenaHistory.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => navigate("/challenges")}
          >
            Join Arena
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {myArenaHistory.length === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-4">
              You haven't joined any arena challenges yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/challenges")}
            >
              Enter the Arena
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {myArenaHistory.map((item, index) => {
              if (!item) return null;
              const { join_type, created_at, challenge, submission, ranking } = item;
              const joinedDate = new Date(created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const timeLeft = getTimeRemaining(challenge.endsAt);
              const isActive = challenge.status === "active";
              const isWinner = ranking?.is_winner;
              const canLeave = isActive && !submission;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getStatusBadge(challenge.status)}
                          <Badge variant="secondary" className="text-[10px]">
                            {join_type === "team" ? "Team" : "Solo"}
                          </Badge>
                          {isWinner && (
                            <Badge className="text-[10px] gap-1 bg-warning/20 text-warning border-warning/30">
                              <Award className="h-3 w-3" />
                              Winner
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm sm:text-base">
                          {challenge.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {challenge.trend}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Prize */}
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-success font-semibold text-sm">
                            <DollarSign className="h-3.5 w-3.5" />
                            {ranking?.prize_won || challenge.winnerPrize}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {isWinner ? "Won" : "Prize"}
                          </p>
                        </div>

                        {/* Time / Status */}
                        <div className="text-right min-w-[80px]">
                          {isActive ? (
                            <>
                              <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                                <Clock className="h-3.5 w-3.5 text-warning" />
                                <span className="truncate">{timeLeft}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">Remaining</p>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{joinedDate}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">Joined</p>
                            </>
                          )}
                        </div>

                        {/* Leave button for active challenges without submission */}
                        {canLeave && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Leave this challenge?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You'll lose your spot in the arena. Your entry fee won't be refunded.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleLeaveChallenge(challenge.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Leave
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    {/* Build Links */}
                    {submission && (
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Your Build</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            {submission.product_name}
                            {submission.total_score && (
                              <Badge variant="outline" className="text-[10px]">
                                Score: {submission.total_score}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 ml-auto">
                            {submission.product_url && (
                              <a
                                href={submission.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Live
                              </a>
                            )}
                            {submission.demo_url && (
                              <a
                                href={submission.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Demo
                              </a>
                            )}
                            {submission.github_repo && (
                              <a
                                href={submission.github_repo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action for active challenges without submission */}
                    {isActive && !submission && (
                      <div className="pt-3 border-t border-border/50">
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => navigate("/submit", { state: { challengeId: challenge.id } })}
                        >
                          Submit Your Build
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}