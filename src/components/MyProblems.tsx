import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  ChevronRight,
  Loader2,
  Users,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

interface JoinedProblem {
  id: string;
  problem_id: string;
  joined_at: string;
  problem: {
    id: string;
    title: string;
    subtitle: string | null;
    category: string;
    niche: string;
    opportunity_score: number;
    slots_filled: number;
    slots_total: number;
    sentiment: string;
  };
}

export function MyProblems() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myProblems = [], isLoading } = useQuery({
    queryKey: ["my_problems", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("problem_builders")
        .select(`
          id,
          problem_id,
          joined_at,
          problem:problems!inner(
            id,
            title,
            subtitle,
            category,
            niche,
            opportunity_score,
            slots_filled,
            slots_total,
            sentiment
          )
        `)
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

      if (error) {
        console.error("Error fetching my problems:", error);
        return [];
      }

      return (data || []) as unknown as JoinedProblem[];
    },
    enabled: !!user,
  });

  const handleLeaveProblem = async (problemId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("problem_builders")
      .delete()
      .eq("user_id", user.id)
      .eq("problem_id", problemId);

    if (error) {
      toast.error("Failed to leave problem");
      return;
    }

    toast.success("Left problem successfully");
    queryClient.invalidateQueries({ queryKey: ["my_problems"] });
    queryClient.invalidateQueries({ queryKey: ["problem_builders"] });
    queryClient.invalidateQueries({ queryKey: ["userStats"] });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="py-3 sm:py-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            My Problems
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
            <Lightbulb className="h-4 w-4 text-primary" />
            My Problems
            {myProblems.length > 0 && (
              <Badge variant="secondary" className="text-[10px] ml-1">
                {myProblems.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => navigate("/problems")}
          >
            Browse All
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {myProblems.length === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <Lightbulb className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-4">
              You haven't joined any problems yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/problems")}
            >
              Explore Problems
            </Button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {myProblems.map((item, index) => {
              const problem = item.problem;
              const joinedDate = new Date(item.joined_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all gap-3">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/problems/${problem.id}`)}
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {problem.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            problem.sentiment === "rising"
                              ? "bg-success/10 text-success border-success/30"
                              : problem.sentiment === "hot"
                              ? "bg-destructive/10 text-destructive border-destructive/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {problem.sentiment}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {problem.title}
                      </h4>
                      {problem.subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {problem.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Builders */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {problem.slots_filled}/{problem.slots_total}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Builders</p>
                      </div>

                      {/* Opportunity Score */}
                      <div className="text-right min-w-[60px]">
                        <div className="text-sm font-semibold text-primary">
                          {problem.opportunity_score}%
                        </div>
                        <p className="text-[10px] text-muted-foreground">Score</p>
                      </div>

                      {/* Leave Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave this problem?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You can rejoin anytime. Your solutions will remain saved.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleLeaveProblem(problem.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Leave
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <ChevronRight 
                        className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block cursor-pointer" 
                        onClick={() => navigate(`/problems/${problem.id}`)}
                      />
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