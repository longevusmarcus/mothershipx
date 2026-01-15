import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyChallengeJoins } from "@/hooks/useChallengeJoins";
import { useChallenges } from "@/hooks/useChallenges";
import { getTimeRemaining } from "@/data/challengesData";

export function MyChallenges() {
  const navigate = useNavigate();
  const { data: myChallengeJoins = [], isLoading: joinsLoading } = useMyChallengeJoins();
  const { data: allChallenges = [], isLoading: challengesLoading } = useChallenges();

  const isLoading = joinsLoading || challengesLoading;

  // Map joined challenges with their details
  const myJoinedChallenges = myChallengeJoins
    .map((join) => {
      const challenge = allChallenges.find((c) => c.id === join.challenge_id);
      if (!challenge) return null;
      return {
        ...join,
        challenge,
      };
    })
    .filter(Boolean);

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
            My Challenges
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
            My Challenges
            {myJoinedChallenges.length > 0 && (
              <Badge variant="secondary" className="text-[10px] ml-1">
                {myJoinedChallenges.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => navigate("/challenges")}
          >
            View All
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {myJoinedChallenges.length === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-4">
              You haven't joined any challenges yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/challenges")}
            >
              Explore Challenges
            </Button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {myJoinedChallenges.map((item, index) => {
              if (!item) return null;
              const { join_type, created_at, challenge } = item;
              const joinedDate = new Date(created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const timeLeft = getTimeRemaining(challenge.endsAt);
              const isActive = challenge.status === "active";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer gap-3"
                    onClick={() => navigate("/challenges")}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {getStatusBadge(challenge.status)}
                        <Badge variant="secondary" className="text-[10px]">
                          {join_type === "team" ? "Team" : "Solo"}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {challenge.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {challenge.trend}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Prize Pool */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-success font-semibold text-sm">
                          <DollarSign className="h-3.5 w-3.5" />
                          {challenge.prizePool}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Prize</p>
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

                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                    </div>
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
