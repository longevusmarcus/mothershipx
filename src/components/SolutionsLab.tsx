import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Edit3,
  Users,
  ThumbsUp,
  MessageSquare,
  GitBranch,
  Clock,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  History,
  Trophy,
  Zap,
  Target,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useSolutions, type Solution } from "@/hooks/useSolutions";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface SolutionsLabProps {
  problemId: string;
  problemTitle: string;
}

const statusConfig = {
  concept: { label: "Concept", color: "bg-muted text-muted-foreground" },
  validated: { label: "Validated", color: "bg-blue-500/10 text-blue-500" },
  building: { label: "Building", color: "bg-amber-500/10 text-amber-500" },
  launched: { label: "Launched", color: "bg-green-500/10 text-green-500" },
};

export const SolutionsLab = ({ problemId, problemTitle }: SolutionsLabProps) => {
  const { user } = useAuth();
  const { solutions, isLoading, createSolution, updateSolution, toggleUpvote, forkSolution } = useSolutions(problemId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: "", description: "", approach: "" });

  const handleUpvote = (solution: Solution) => {
    if (!user) return;
    toggleUpvote.mutate({ solutionId: solution.id, hasUpvoted: solution.has_upvoted || false });
  };

  const handleFork = (id: string) => {
    forkSolution.mutate(id);
  };

  const handleStartEdit = (solution: Solution) => {
    setEditingId(solution.id);
    setEditContent(solution.approach || "");
  };

  const handleSaveEdit = (id: string) => {
    updateSolution.mutate(
      { id, approach: editContent },
      {
        onSuccess: () => {
          setEditingId(null);
        },
      }
    );
  };

  const handleCreateIdea = () => {
    if (!newIdea.title || !newIdea.description) return;
    
    createSolution.mutate(
      {
        title: newIdea.title,
        description: newIdea.description,
        approach: newIdea.approach || undefined,
      },
      {
        onSuccess: () => {
          setShowNewIdea(false);
          setNewIdea({ title: "", description: "", approach: "" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Solutions Lab</h3>
            <p className="text-xs text-muted-foreground">
              Wiki-style collaborative ideas • {solutions.length} solutions
            </p>
          </div>
        </div>
        <Button
          variant="glow"
          size="sm"
          onClick={() => setShowNewIdea(true)}
          className="gap-2"
          disabled={!user}
        >
          <Plus className="h-4 w-4" />
          New Idea
        </Button>
      </div>

      {/* AI Suggested Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20"
      >
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">AI analyzed this trend</p>
          <p className="text-xs text-muted-foreground truncate">
            Collaborative solutions based on market signals & pain points
          </p>
        </div>
        <Badge variant="outline" className="gap-1 shrink-0">
          <Sparkles className="h-3 w-3" />
          AI
        </Badge>
      </motion.div>

      {/* New Idea Form */}
      <AnimatePresence>
        {showNewIdea && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card variant="glow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Create New Idea</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewIdea(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Idea title..."
                  value={newIdea.title}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Describe your solution concept..."
                  value={newIdea.description}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px]"
                />
                <Textarea
                  placeholder="Implementation approach (optional)..."
                  value={newIdea.approach}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, approach: e.target.value }))}
                  className="min-h-[60px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowNewIdea(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreateIdea} disabled={createSolution.isPending}>
                    {createSolution.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solutions List */}
      {solutions.length === 0 ? (
        <Card variant="elevated" className="p-6 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No solutions yet. Be the first to propose an idea!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant={expandedId === solution.id ? "glow" : "elevated"}
                className="overflow-hidden transition-all"
              >
                <CardContent className="p-0">
                  {/* Header Row */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === solution.id ? null : solution.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Rank Badge */}
                      <div className={`
                        h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm
                        ${index === 0 ? "bg-amber-500/20 text-amber-500" : 
                          index === 1 ? "bg-slate-400/20 text-slate-400" :
                          index === 2 ? "bg-orange-600/20 text-orange-600" :
                          "bg-muted text-muted-foreground"}
                      `}>
                        {index === 0 ? <Trophy className="h-4 w-4" /> : `#${index + 1}`}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm truncate">{solution.title}</h4>
                          {solution.ai_generated && (
                            <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
                              <Sparkles className="h-2.5 w-2.5" />
                              AI
                            </Badge>
                          )}
                          <Badge className={`text-[10px] px-1.5 py-0 ${statusConfig[solution.status].color}`}>
                            {statusConfig[solution.status].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {solution.description}
                        </p>

                        {/* Stats Row */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className={`flex items-center gap-1 ${solution.has_upvoted ? "text-primary" : ""}`}>
                            <ThumbsUp className={`h-3 w-3 ${solution.has_upvoted ? "fill-current" : ""}`} />
                            {solution.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {solution.forks}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {solution.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <History className="h-3 w-3" />
                            {solution.edit_count} edits
                          </span>
                        </div>
                      </div>

                      {/* Market Fit Score */}
                      <div className="text-center shrink-0">
                        <div className="text-lg font-bold text-primary">{solution.market_fit}%</div>
                        <div className="text-[10px] text-muted-foreground">Market Fit</div>
                      </div>

                      {/* Expand Icon */}
                      <div className="shrink-0">
                        {expandedId === solution.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedId === solution.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                          {/* Approach Section - Wiki Style */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Implementation Approach
                              </h5>
                              {editingId !== solution.id && user && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartEdit(solution)}
                                  className="h-7 text-xs gap-1"
                                >
                                  <Edit3 className="h-3 w-3" />
                                  Edit
                                </Button>
                              )}
                            </div>

                            {editingId === solution.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="min-h-[100px] text-sm"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingId(null)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(solution.id)}
                                    disabled={updateSolution.isPending}
                                  >
                                    {updateSolution.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <Check className="h-4 w-4 mr-1" />
                                    )}
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                                {solution.approach || "No approach defined yet. Click Edit to add one."}
                              </div>
                            )}
                          </div>

                          {/* Tech Stack */}
                          {solution.tech_stack && solution.tech_stack.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Suggested Tech Stack
                              </h5>
                              <div className="flex flex-wrap gap-1.5">
                                {solution.tech_stack.map((tech) => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Contributors */}
                          {solution.contributors && solution.contributors.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Contributors ({solution.contributors.length})
                              </h5>
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {solution.contributors.slice(0, 5).map((contributor) => (
                                    <Avatar key={contributor.id} className="h-7 w-7 border-2 border-background">
                                      <AvatarFallback className="text-[10px] bg-secondary">
                                        {contributor.profile?.name?.[0] || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                {solution.contributors.length > 5 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{solution.contributors.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Last Edited */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Last edited {formatDistanceToNow(new Date(solution.updated_at), { addSuffix: true })}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                            <Button
                              variant={solution.has_upvoted ? "default" : "outline"}
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleUpvote(solution)}
                              disabled={!user}
                            >
                              <ThumbsUp className={`h-3.5 w-3.5 ${solution.has_upvoted ? "fill-current" : ""}`} />
                              {solution.has_upvoted ? "Upvoted" : "Upvote"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleFork(solution.id)}
                              disabled={!user || forkSolution.isPending}
                            >
                              <GitBranch className="h-3.5 w-3.5" />
                              Fork
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
