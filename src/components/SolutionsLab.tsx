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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SolutionIdea {
  id: string;
  title: string;
  description: string;
  approach: string;
  techStack: string[];
  marketFit: number;
  upvotes: number;
  forks: number;
  contributors: { name: string; avatar?: string }[];
  lastEdited: string;
  lastEditor: string;
  editCount: number;
  status: "concept" | "validated" | "building" | "launched";
  aiGenerated: boolean;
  comments: number;
}

interface SolutionsLabProps {
  problemId: string;
  problemTitle: string;
}

// Mock solution ideas based on market analysis
const mockSolutionIdeas: SolutionIdea[] = [
  {
    id: "sol-1",
    title: "AI-Powered Interactive Onboarding",
    description: "A conversational AI that adapts the onboarding flow based on user responses and behavior patterns.",
    approach: "Use LLM to create personalized onboarding paths. Analyze user hesitation points in real-time. Auto-skip steps for power users.",
    techStack: ["React", "OpenAI", "Vercel AI SDK", "Supabase"],
    marketFit: 89,
    upvotes: 127,
    forks: 23,
    contributors: [
      { name: "Alex Chen" },
      { name: "Sarah K" },
      { name: "Mike J" },
    ],
    lastEdited: "2 hours ago",
    lastEditor: "Alex Chen",
    editCount: 47,
    status: "validated",
    aiGenerated: false,
    comments: 34,
  },
  {
    id: "sol-2",
    title: "Gamified Progress System",
    description: "Turn onboarding into a game with achievements, streaks, and social proof elements.",
    approach: "Implement XP system for completed steps. Add leaderboards for team onboarding. Create shareable achievement badges.",
    techStack: ["React", "Framer Motion", "Firebase", "Lottie"],
    marketFit: 76,
    upvotes: 89,
    forks: 15,
    contributors: [
      { name: "Emma D" },
      { name: "Chris T" },
    ],
    lastEdited: "5 hours ago",
    lastEditor: "Emma D",
    editCount: 31,
    status: "building",
    aiGenerated: false,
    comments: 21,
  },
  {
    id: "sol-3",
    title: "Video-First Micro-Tutorials",
    description: "Short, TikTok-style video tutorials that users can swipe through for each feature.",
    approach: "15-second max videos per feature. User-generated content from power users. AI-generated captions and translations.",
    techStack: ["React", "Mux", "Cloudflare Stream", "Whisper API"],
    marketFit: 82,
    upvotes: 156,
    forks: 41,
    contributors: [
      { name: "Jordan L" },
      { name: "Priya S" },
      { name: "Tom H" },
      { name: "Lisa M" },
    ],
    lastEdited: "1 hour ago",
    lastEditor: "Priya S",
    editCount: 89,
    status: "launched",
    aiGenerated: true,
    comments: 67,
  },
];

const statusConfig = {
  concept: { label: "Concept", color: "bg-muted text-muted-foreground" },
  validated: { label: "Validated", color: "bg-blue-500/10 text-blue-500" },
  building: { label: "Building", color: "bg-amber-500/10 text-amber-500" },
  launched: { label: "Launched", color: "bg-green-500/10 text-green-500" },
};

export const SolutionsLab = ({ problemId, problemTitle }: SolutionsLabProps) => {
  const { toast } = useToast();
  const [solutions, setSolutions] = useState(mockSolutionIdeas);
  const [expandedId, setExpandedId] = useState<string | null>("sol-1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: "", description: "", approach: "" });

  const handleUpvote = (id: string) => {
    setSolutions(prev =>
      prev.map(s =>
        s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s
      )
    );
    toast({
      title: "Upvoted! 🔥",
      description: "Your vote helps surface the best ideas",
    });
  };

  const handleFork = (id: string) => {
    const original = solutions.find(s => s.id === id);
    if (!original) return;
    
    toast({
      title: "Forked! 🌿",
      description: "Create your own version of this idea",
    });
  };

  const handleStartEdit = (solution: SolutionIdea) => {
    setEditingId(solution.id);
    setEditContent(solution.approach);
  };

  const handleSaveEdit = (id: string) => {
    setSolutions(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              approach: editContent,
              lastEdited: "Just now",
              lastEditor: "You",
              editCount: s.editCount + 1,
            }
          : s
      )
    );
    setEditingId(null);
    toast({
      title: "Edit saved! ✨",
      description: "You're now a contributor to this idea",
    });
  };

  const handleCreateIdea = () => {
    if (!newIdea.title || !newIdea.description) return;
    
    const newSolution: SolutionIdea = {
      id: `sol-${Date.now()}`,
      title: newIdea.title,
      description: newIdea.description,
      approach: newIdea.approach || "Define your approach...",
      techStack: [],
      marketFit: 0,
      upvotes: 1,
      forks: 0,
      contributors: [{ name: "You" }],
      lastEdited: "Just now",
      lastEditor: "You",
      editCount: 1,
      status: "concept",
      aiGenerated: false,
      comments: 0,
    };
    
    setSolutions(prev => [newSolution, ...prev]);
    setShowNewIdea(false);
    setNewIdea({ title: "", description: "", approach: "" });
    toast({
      title: "Idea created! 🚀",
      description: "Others can now edit and build on your idea",
    });
  };

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
            3 solutions generated based on market signals & pain points
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
                  <Button size="sm" onClick={handleCreateIdea}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solutions List */}
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
                        {solution.aiGenerated && (
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
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
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
                          {solution.editCount} edits
                        </span>
                      </div>
                    </div>

                    {/* Market Fit Score */}
                    <div className="text-center shrink-0">
                      <div className="text-lg font-bold text-primary">{solution.marketFit}%</div>
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
                            {editingId !== solution.id && (
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
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                              {solution.approach}
                            </div>
                          )}
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Suggested Tech Stack
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {solution.techStack.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2">
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </div>
                        </div>

                        {/* Contributors */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Contributors ({solution.contributors.length})
                          </h5>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {solution.contributors.slice(0, 5).map((c, i) => (
                                <Avatar key={i} className="h-7 w-7 border-2 border-background">
                                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                    {c.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {solution.contributors.length > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{solution.contributors.length - 5} more
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground ml-2">
                              Last edited by {solution.lastEditor} • {solution.lastEdited}
                            </span>
                          </div>
                        </div>

                        {/* Market Fit Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Market Fit Score
                            </span>
                            <span className="font-medium">{solution.marketFit}%</span>
                          </div>
                          <Progress value={solution.marketFit} className="h-2" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpvote(solution.id)}
                            className="gap-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Upvote
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFork(solution.id)}
                            className="gap-1"
                          >
                            <GitBranch className="h-3 w-3" />
                            Fork
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Discuss
                          </Button>
                          <div className="flex-1" />
                          <Button variant="glow" size="sm" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Build This
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

      {/* Community Stats */}
      <Card variant="elevated">
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{solutions.length}</div>
              <div className="text-[10px] text-muted-foreground">Ideas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                {solutions.reduce((acc, s) => acc + s.contributors.length, 0)}
              </div>
              <div className="text-[10px] text-muted-foreground">Contributors</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                {solutions.reduce((acc, s) => acc + s.editCount, 0)}
              </div>
              <div className="text-[10px] text-muted-foreground">Total Edits</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                {solutions.filter(s => s.status === "launched").length}
              </div>
              <div className="text-[10px] text-muted-foreground">Launched</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
