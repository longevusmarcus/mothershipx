import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lightbulb, ChevronRight, Loader2, TrendingUp, LogOut } from "lucide-react";
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
    category: string;
    opportunity_score: number;
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
        .select(`id, problem_id, joined_at, problem:problems!inner(id, title, category, opportunity_score, sentiment)`)
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });
      if (error) return [];
      return (data || []) as unknown as JoinedProblem[];
    },
    enabled: !!user,
  });

  const handleLeaveProblem = async (problemId: string) => {
    if (!user) return;
    const { error } = await supabase.from("problem_builders").delete().eq("user_id", user.id).eq("problem_id", problemId);
    if (error) {
      toast.error("Failed to leave");
      return;
    }
    toast.success("Left problem");
    queryClient.invalidateQueries({ queryKey: ["my_problems"] });
    queryClient.invalidateQueries({ queryKey: ["userStats"] });
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            My Problems
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            My Problems
            {myProblems.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{myProblems.length}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2" onClick={() => navigate("/problems")}>
            Browse
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {myProblems.length === 0 ? (
          <div className="text-center py-6">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground mb-3">No problems joined yet</p>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate("/problems")}>
              Explore
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {myProblems.map((item, index) => {
              const problem = item.problem;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => navigate(`/problems/${problem.id}`)}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{problem.category}</Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                          problem.sentiment === "rising" ? "bg-success/10 text-success border-success/30" : "bg-muted"
                        }`}>
                          <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                          {problem.sentiment}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-medium truncate">{problem.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-primary">{problem.opportunity_score}%</div>
                        <p className="text-[9px] text-muted-foreground">Score</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                            <LogOut className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave problem?</AlertDialogTitle>
                            <AlertDialogDescription>You can rejoin anytime.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleLeaveProblem(problem.id)} className="bg-destructive text-destructive-foreground">Leave</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
