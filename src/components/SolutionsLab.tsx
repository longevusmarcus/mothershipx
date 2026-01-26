import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
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
  Target,
  Zap,
  X,
  Loader2,
  Users,
  DollarSign,
  Code,
  ArrowRight,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useSolutions, type Solution, type LandingPageData } from "@/hooks/useSolutions";
import { useVerifiedBuilders } from "@/hooks/useVerifiedBuilders";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { AIIdeaGeneratorModal } from "@/components/AIIdeaGeneratorModal";

interface SolutionsLabProps {
  problemId: string;
  problemTitle: string;
  problemTrend?: string;
  problemPainPoints?: string[];
  problemCategory?: string;
  opportunityScore?: number;
  demandVelocity?: number;
  competitionGap?: number;
  sources?: any[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  concept: { label: "Concept", color: "bg-muted text-muted-foreground" },
  validated: { label: "Validated", color: "bg-blue-500/10 text-blue-500" },
  building: { label: "Building", color: "bg-amber-500/10 text-amber-500" },
  launched: { label: "Launched", color: "bg-green-500/10 text-green-500" },
};


// Parse markdown approach into structured sections
function parseApproachSections(approach: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = approach.split("\n");
  let currentSection = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for ## Header format
    if (trimmedLine.startsWith("## ")) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.join("\n").trim();
      }
      currentSection = trimmedLine.replace("## ", "").trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections[currentSection] = currentContent.join("\n").trim();
  }

  return sections;
}

// Parse feature list from markdown
function parseFeatures(content: string): Array<{ title: string; description: string }> {
  const features: Array<{ title: string; description: string }> = [];
  const lines = content.split("\n").filter((l) => l.trim().startsWith("-"));

  for (const line of lines) {
    const match = line.match(/^-\s*\*\*([^*]+)\*\*:\s*(.+)$/);
    if (match) {
      features.push({ title: match[1].trim(), description: match[2].trim() });
    } else {
      const simpleMatch = line.match(/^-\s*(.+)$/);
      if (simpleMatch) {
        features.push({ title: simpleMatch[1].trim(), description: "" });
      }
    }
  }

  return features;
}

// Render approach text with proper formatting
function ApproachDisplay({ approach }: { approach: string | null }) {
  if (!approach) {
    return <p className="text-muted-foreground italic">No approach defined yet. Click Edit to add one.</p>;
  }

  // Try to parse as structured sections first
  const sections = parseApproachSections(approach);
  const hasStructuredSections = Object.keys(sections).length > 0;

  if (hasStructuredSections) {
    const features = sections["Key Features"] ? parseFeatures(sections["Key Features"]) : [];

    return (
      <div className="space-y-6">
        {/* Unique Value */}
        {sections["Unique Value"] && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <h6 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Unique Value</h6>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pl-8">{sections["Unique Value"]}</p>
          </div>
        )}

        {/* Target Persona */}
        {sections["Target Persona"] && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Users className="h-3 w-3 text-primary" />
              </div>
              <h6 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Target Persona</h6>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pl-8">{sections["Target Persona"]}</p>
          </div>
        )}

        {/* Key Features */}
        {features.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Zap className="h-3 w-3 text-primary" />
              </div>
              <h6 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Key Features</h6>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
              {features.map((feature, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border/50 bg-secondary/20">
                  <p className="text-sm font-medium text-foreground">{feature.title}</p>
                  {feature.description && <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monetization */}
        {sections["Monetization"] && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-3 w-3 text-primary" />
              </div>
              <h6 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Monetization</h6>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pl-8">{sections["Monetization"]}</p>
          </div>
        )}

        {/* Tech Stack (if in approach) */}
        {sections["Tech Stack"] && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Code className="h-3 w-3 text-primary" />
              </div>
              <h6 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Tech Stack</h6>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pl-8">{sections["Tech Stack"]}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback: Parse the approach into sections with old format
  const lines = approach.split("\n").filter((line) => line.trim());

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        // Phase headers (bold text like **Phase 1 - Core Problem**)
        if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
          const headerText = trimmedLine.replace(/\*\*/g, "");

          return (
            <div key={index} className="flex items-center gap-2 pt-2 first:pt-0">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Target className="h-3 w-3 text-primary" />
              </div>
              <h6 className="font-semibold text-sm text-foreground">{headerText}</h6>
            </div>
          );
        }

        // Inline bold (like **text**: description)
        if (trimmedLine.includes("**")) {
          const parsed = trimmedLine.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
          return (
            <p
              key={index}
              className="text-sm text-muted-foreground pl-2 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: parsed
                  .replace(/<strong>/g, '<span class="text-foreground font-medium">')
                  .replace(/<\/strong>/g, "</span>"),
              }}
            />
          );
        }

        // Bullet points (lines starting with • or -)
        if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-")) {
          const bulletText = trimmedLine.replace(/^[•-]\s*/, "");

          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <Zap className="h-3 w-3 text-primary mt-1 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">{bulletText}</p>
            </div>
          );
        }

        // Regular text
        return (
          <p key={index} className="text-sm text-muted-foreground pl-2">
            {trimmedLine}
          </p>
        );
      })}
    </div>
  );
}

// Landing Page Preview component
function LandingPagePreview({ landingPage, solutionTitle }: { landingPage: LandingPageData; solutionTitle: string }) {
  return (
    <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-light tracking-tight mb-3 leading-[1.1]">{landingPage.hero.headline}</h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            {landingPage.hero.subheadline}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" className="h-9 px-5 text-sm font-normal">
              {landingPage.hero.ctaText}
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-4 text-sm font-normal">
              Learn more
            </Button>
          </div>
        </div>
      </section>

      {/* Product Mockup */}
      {landingPage.mockupImage && (
        <section className="px-6 pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg overflow-hidden border border-border/50 shadow-2xl">
              <img src={landingPage.mockupImage} alt={`${solutionTitle} product mockup`} className="w-full h-auto" />
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {landingPage.stats && landingPage.stats.length > 0 && (
        <section className="px-6 py-8 border-y border-border/50">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {landingPage.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-light tracking-tight mb-0.5">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {landingPage.features && landingPage.features.length > 0 && (
        <section className="px-6 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Features</p>
              <h2 className="text-lg font-light tracking-tight">Everything you need</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {landingPage.features.slice(0, 3).map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full border border-border/50 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-xs font-medium mb-1">{feature.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      {landingPage.howItWorks && landingPage.howItWorks.length > 0 && (
        <section className="px-6 py-10 bg-muted/20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Process</p>
              <h2 className="text-lg font-light tracking-tight">How it works</h2>
            </div>
            <div className="space-y-3">
              {landingPage.howItWorks.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] shrink-0">
                    {step.step}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="text-xs font-medium mb-0.5">{step.title}</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial Section */}
      {landingPage.testimonial && (
        <section className="px-6 py-10 border-t border-border/50">
          <div className="max-w-lg mx-auto text-center">
            <blockquote className="text-sm font-light leading-relaxed mb-3 italic">
              "{landingPage.testimonial.quote}"
            </blockquote>
            <div>
              <p className="text-xs font-medium">{landingPage.testimonial.author}</p>
              <p className="text-[10px] text-muted-foreground">{landingPage.testimonial.role}</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-6 py-10 bg-foreground text-background">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-lg font-light tracking-tight mb-2">Ready to get started?</h2>
          <p className="text-xs text-background/60 mb-4">Join thousands of users transforming their workflow.</p>
          <Button variant="secondary" size="sm" className="h-9 px-5 text-sm font-normal">
            {landingPage.hero.ctaText}
            <ArrowUpRight className="h-3.5 w-3.5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}

export const SolutionsLab = ({
  problemId,
  problemTitle,
  problemTrend,
  problemPainPoints,
  problemCategory,
  opportunityScore,
  demandVelocity,
  competitionGap,
  sources,
}: SolutionsLabProps) => {
  const { user } = useAuth();
  const { isAdmin } = useSubscription();
  const {
    solutions: dbSolutions,
    isLoading,
    createSolution,
    updateSolution,
    toggleUpvote,
    forkSolution,
    deleteSolution,
  } = useSolutions(problemId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Collect all contributor user IDs for verification check
  const allContributorIds = dbSolutions
    .flatMap((s) => s.contributors?.map((c) => c.user_id) || [])
    .filter((id): id is string => !!id);
  const { data: verifiedBuilders } = useVerifiedBuilders(allContributorIds);

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
      },
    );
  };

  // Only show real database solutions (no dummy data)
  const solutions = dbSolutions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Idea Generator Modal */}
      <AIIdeaGeneratorModal
        open={showAIGenerator}
        onOpenChange={setShowAIGenerator}
        problemId={problemId}
        problemTitle={problemTitle}
        problemCategory={problemCategory || "SaaS"}
        painPoints={problemPainPoints || []}
        niche={problemTrend || problemTitle}
        opportunityScore={opportunityScore || 50}
        demandVelocity={demandVelocity}
        competitionGap={competitionGap}
        sources={sources}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg">Solutions Lab</h3>
          <p className="text-sm text-muted-foreground">Wiki-style collaborative ideas • {solutions.length} solutions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAIGenerator(true)}
          className="gap-2 group"
          disabled={!user}
        >
          <Sparkles className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
          New Idea
        </Button>
      </div>

      {/* Solutions List */}
      <div className="space-y-3">
        {solutions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            <div>
              <p className="text-sm text-muted-foreground">No ideas yet for this problem.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Click "New Idea" to generate AI-powered startup concepts.</p>
            </div>
          </div>
        )}
        {solutions.map((solution, index) => (
          <motion.div
            key={solution.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className={`rounded-lg border ${expandedId === solution.id ? "border-foreground/20" : "border-border/50"} bg-background overflow-hidden`}
            >
              {/* Header Row */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === solution.id ? null : solution.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium
                    ${
                      index === 0
                        ? "bg-foreground/10 text-foreground"
                        : index === 1
                          ? "bg-foreground/5 text-foreground/70"
                          : index === 2
                            ? "bg-foreground/5 text-foreground/60"
                            : "bg-secondary text-muted-foreground"
                    }
                  `}
                  >
                    {index === 0 ? <Trophy className="h-4 w-4" /> : `#${index + 1}`}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{solution.title}</h4>
                      {solution.ai_generated && (
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">AI</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusConfig[solution.status].color}`}>
                        {statusConfig[solution.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{solution.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className={`flex items-center gap-1 ${solution.has_upvoted ? "text-foreground" : ""}`}>
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

                  {/* Market Fit */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-semibold">{solution.market_fit}%</div>
                    <div className="text-[10px] text-muted-foreground">Market Fit</div>
                  </div>

                  {/* Expand */}
                  <div className="shrink-0">
                    {expandedId === solution.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                    <div className="px-4 pb-4 border-t border-border/50 pt-4">
                      {/* Use tabs if landing page exists */}
                      {solution.landing_page ? (
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="w-full h-9 p-0.5 bg-muted/30 mb-4">
                            <TabsTrigger value="overview" className="flex-1 text-xs font-normal">
                              Overview
                            </TabsTrigger>
                            <TabsTrigger value="landing" className="flex-1 text-xs font-normal">
                              Landing Page
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="mt-0 space-y-4">
                            {/* Approach Section */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
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
                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveEdit(solution.id)}
                                      disabled={updateSolution.isPending}
                                    >
                                      {updateSolution.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 rounded-lg bg-secondary/30">
                                  <ApproachDisplay approach={solution.approach} />
                                </div>
                              )}
                            </div>

                            {/* Tech Stack */}
                            {solution.tech_stack && solution.tech_stack.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
                                  Suggested Tech Stack
                                </h5>
                                <div className="flex flex-wrap gap-1.5">
                                  {solution.tech_stack.map((tech) => (
                                    <span
                                      key={tech}
                                      className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground/80"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="landing" className="mt-0">
                            <LandingPagePreview landingPage={solution.landing_page} solutionTitle={solution.title} />
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <div className="space-y-4">
                          {/* Approach Section - no tabs */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
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
                                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(solution.id)}
                                    disabled={updateSolution.isPending}
                                  >
                                    {updateSolution.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 rounded-lg bg-secondary/30">
                                <ApproachDisplay approach={solution.approach} />
                              </div>
                            )}
                          </div>

                          {/* Tech Stack */}
                          {solution.tech_stack && solution.tech_stack.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
                                Suggested Tech Stack
                              </h5>
                              <div className="flex flex-wrap gap-1.5">
                                {solution.tech_stack.map((tech) => (
                                  <span
                                    key={tech}
                                    className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground/80"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contributors */}
                      {solution.contributors && solution.contributors.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
                            Contributors ({solution.contributors.length})
                          </h5>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {solution.contributors.slice(0, 5).map((contributor) => {
                                const isVerified = verifiedBuilders?.has(contributor.user_id || "");
                                return (
                                  <TooltipProvider key={contributor.id} delayDuration={200}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="relative">
                                          <Avatar className="h-7 w-7 border-2 border-background">
                                            <AvatarFallback className="text-[10px] bg-secondary">
                                              {contributor.profile?.name?.[0] || "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                          {isVerified && (
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-background flex items-center justify-center">
                                              <VerifiedBadge size="xs" showTooltip={false} />
                                            </div>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">
                                        <p>
                                          {contributor.profile?.name || "Anonymous"}
                                          {isVerified ? " ✓ Verified" : ""}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                        <Clock className="h-3 w-3" />
                        Last edited {formatDistanceToNow(new Date(solution.updated_at), { addSuffix: true })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 mt-2 border-t border-border/50">
                        <Button
                          variant={solution.has_upvoted ? "default" : "outline"}
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={() => handleUpvote(solution)}
                          disabled={!user}
                        >
                          <ThumbsUp className={`h-3 w-3 ${solution.has_upvoted ? "fill-current" : ""}`} />
                          {solution.has_upvoted ? "Upvoted" : "Upvote"}
                        </Button>

                        {/* Admin delete button */}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs h-8 ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteSolution.mutate(solution.id)}
                            disabled={deleteSolution.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
