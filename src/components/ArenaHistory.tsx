import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Clock, Zap, Vote, CheckCircle2, ChevronRight, DollarSign, Loader2, Calendar, ExternalLink, LogOut, Award, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMyChallengeJoins, useLeaveChallenge } from "@/hooks/useChallengeJoins";
import { useChallenges } from "@/hooks/useChallenges";
import { getTimeRemaining } from "@/data/challengesData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
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

const INITIAL_DISPLAY_COUNT = 5;

export function ArenaHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myChallengeJoins = [], isLoading: joinsLoading } = useMyChallengeJoins();
  const { data: allChallenges = [], isLoading: challengesLoading } = useChallenges();
  const leaveChallengeMutation = useLeaveChallenge();
  const [showAll, setShowAll] = useState(false);

  const { data: mySubmissions = [] } = useQuery({
    queryKey: ["my_submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("submissions").select("id, challenge_id, product_name, product_url, demo_url, github_repo, total_score").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: myRankings = [] } = useQuery({
    queryKey: ["my_rankings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("rankings").select("id, challenge_id, rank, is_winner, prize_won").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const isLoading = joinsLoading || challengesLoading;

  const myArenaHistory = myChallengeJoins.map((join) => {
    const challenge = allChallenges.find((c) => c.id === join.challenge_id);
    if (!challenge) return null;
    return {
      ...join,
      challenge,
      submission: mySubmissions.find((s) => s.challenge_id === join.challenge_id),
      ranking: myRankings.find((r) => r.challenge_id === join.challenge_id),
    };
  }).filter(Boolean);

  const displayedHistory = showAll ? myArenaHistory : myArenaHistory.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = myArenaHistory.length > INITIAL_DISPLAY_COUNT;

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      await leaveChallengeMutation.mutateAsync(challengeId);
      toast.success("Left challenge");
    } catch {
      toast.error("Failed to leave");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge variant="outline" className="text-[10px] gap-0.5 bg-success/10 text-success border-success/30 px-1.5 py-0"><Zap className="h-2.5 w-2.5" />Active</Badge>;
    if (status === "voting") return <Badge variant="outline" className="text-[10px] gap-0.5 bg-warning/10 text-warning border-warning/30 px-1.5 py-0"><Vote className="h-2.5 w-2.5" />Voting</Badge>;
    return <Badge variant="outline" className="text-[10px] gap-0.5 bg-muted px-1.5 py-0"><CheckCircle2 className="h-2.5 w-2.5" />Done</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4" />Arena History</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const renderHistoryItem = (item: NonNullable<typeof myArenaHistory[number]>, index: number) => {
    const { join_type, created_at, challenge, submission, ranking } = item;
    const joinedDate = new Date(created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timeLeft = getTimeRemaining(challenge.endsAt);
    const isActive = challenge.status === "active";
    const isWinner = ranking?.is_winner;
    const canLeave = isActive && !submission;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="p-3 rounded-lg bg-muted/30 border border-border/50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {getStatusBadge(challenge.status)}
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{join_type === "team" ? "Team" : "Solo"}</Badge>
              {isWinner && <Badge className="text-[10px] gap-0.5 bg-warning/20 text-warning border-warning/30 px-1.5 py-0"><Award className="h-2.5 w-2.5" />Winner</Badge>}
            </div>
            <h4 className="text-sm font-medium truncate">{challenge.title}</h4>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-0.5 text-success font-semibold text-xs">
                <DollarSign className="h-3 w-3" />
                {ranking?.prize_won || challenge.winnerPrize}
              </div>
              <p className="text-[9px] text-muted-foreground">{isWinner ? "Won" : "Prize"}</p>
            </div>
            <div className="text-right">
              {isActive ? (
                <>
                  <div className="flex items-center gap-0.5 text-xs font-medium">
                    <Clock className="h-3 w-3 text-warning" />
                    <span className="truncate max-w-[50px]">{timeLeft}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">Left</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {joinedDate}
                  </div>
                  <p className="text-[9px] text-muted-foreground">Joined</p>
                </>
              )}
            </div>
            {canLeave && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <LogOut className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave challenge?</AlertDialogTitle>
                    <AlertDialogDescription>Entry fee won't be refunded.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleLeaveChallenge(challenge.id)} className="bg-destructive text-destructive-foreground">Leave</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Submission Links */}
        {submission && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium truncate">{submission.product_name}</span>
                {submission.total_score && <Badge variant="outline" className="text-[9px] px-1 py-0">Score: {submission.total_score}</Badge>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                {submission.product_url && (
                  <a href={submission.product_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                    <ExternalLink className="h-2.5 w-2.5" />Live
                  </a>
                )}
                {submission.github_repo && (
                  <a href={submission.github_repo} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                    <ExternalLink className="h-2.5 w-2.5" />GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit CTA */}
        {isActive && !submission && (
          <div className="pt-2 border-t border-border/50">
            <Button size="sm" className="h-7 text-xs w-full" onClick={() => navigate("/submit", { state: { challengeId: challenge.id } })}>
              Submit Build
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Arena History
            {myArenaHistory.length > 0 && <Badge variant="secondary" className="text-[10px]">{myArenaHistory.length}</Badge>}
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2" onClick={() => navigate("/challenges")}>
            Join
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {myArenaHistory.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground mb-3">No challenges joined</p>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate("/challenges")}>
              Enter Arena
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {showAll && hasMore ? (
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-2">
                  {displayedHistory.map((item, index) => item && renderHistoryItem(item, index))}
                </div>
              </ScrollArea>
            ) : (
              <div className="space-y-2">
                {displayedHistory.map((item, index) => item && renderHistoryItem(item, index))}
              </div>
            )}
            
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    Show less
                    <ChevronUp className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  <>
                    Show {myArenaHistory.length - INITIAL_DISPLAY_COUNT} more
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}