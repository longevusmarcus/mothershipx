import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Sparkles,
  Zap,
  Shield,
  Brain,
  Rocket,
  Target,
  Users,
  DollarSign,
  Code,
  ExternalLink,
  Check,
  Lightbulb,
  TrendingUp,
  Star,
  ArrowRight,
  Globe,
  Heart,
  Clock,
  Award,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useSolutions } from "@/hooks/useSolutions";

interface AIIdeaGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problemId: string;
  problemTitle: string;
  problemCategory: string;
  painPoints: string[];
  niche: string;
  opportunityScore: number;
  demandVelocity?: number;
  competitionGap?: number;
  sources?: any[];
}

interface GeneratedIdea {
  name: string;
  tagline: string;
  description: string;
  uniqueValue: string;
  targetPersona: string;
  keyFeatures: Array<{ icon: string; title: string; description: string }>;
  techStack: string[];
  monetization: string;
  landingPage: {
    hero: {
      headline: string;
      subheadline: string;
      ctaText: string;
    };
    features: Array<{ icon: string; title: string; description: string }>;
    testimonial: {
      quote: string;
      author: string;
      avatar: string;
    };
    gradient: string;
  };
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Zap,
  Shield,
  Brain,
  Rocket,
  Target,
  Users,
  DollarSign,
  Code,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Star,
  Globe,
  Heart,
  Clock,
  Award,
  Check,
};

const getIcon = (iconName: string) => {
  const IconComponent = iconMap[iconName] || Sparkles;
  return IconComponent;
};

export function AIIdeaGeneratorModal({
  open,
  onOpenChange,
  problemId,
  problemTitle,
  problemCategory,
  painPoints,
  niche,
  opportunityScore,
  demandVelocity,
  competitionGap,
  sources,
}: AIIdeaGeneratorModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [idea, setIdea] = useState<GeneratedIdea | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { createSolution } = useSolutions(problemId);

  const generateIdea = async () => {
    setIsGenerating(true);
    setIdea(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-idea", {
        body: {
          problemTitle,
          problemCategory,
          painPoints,
          niche,
          opportunityScore,
          demandVelocity,
          competitionGap,
          sources,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success || !data?.idea) {
        throw new Error(data?.error || "Failed to generate idea");
      }

      setIdea(data.idea);
      toast.success("AI idea generated!");
    } catch (err) {
      console.error("Error generating idea:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate idea");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdea = () => {
    if (!idea) return;

    const approach = `## Unique Value
${idea.uniqueValue}

## Target Persona
${idea.targetPersona}

## Key Features
${idea.keyFeatures.map((f) => `- **${f.title}**: ${f.description}`).join("\n")}

## Tech Stack
${idea.techStack.join(", ")}

## Monetization
${idea.monetization}`;

    createSolution.mutate(
      {
        title: idea.name,
        description: idea.description,
        approach,
        techStack: idea.techStack,
      },
      {
        onSuccess: () => {
          toast.success("Idea saved to Solutions Lab!");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Idea Generator
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          {!idea && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Lightbulb className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate a Brilliant Idea</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Our AI will analyze the problem context, pain points, market signals, and competition
                to create a unique, actionable product idea with a stunning landing page design.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge variant="secondary" className="gap-1">
                  <Target className="h-3 w-3" />
                  {problemCategory}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {opportunityScore}% Opportunity
                </Badge>
                {demandVelocity && (
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {demandVelocity}% Demand
                  </Badge>
                )}
              </div>
              <Button onClick={generateIdea} size="lg" className="gap-2 px-8">
                <Sparkles className="h-4 w-4" />
                Generate AI Idea
              </Button>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Generating Your Idea...</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing market signals and crafting something brilliant
              </p>
            </motion.div>
          )}

          {idea && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="overview" className="flex-1">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="landing" className="flex-1">
                    Landing Page
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Hero Section */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{idea.name}</h2>
                        <p className="text-muted-foreground">{idea.tagline}</p>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-0">AI Generated</Badge>
                    </div>
                    <p className="text-foreground/80">{idea.description}</p>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-border/50 bg-background">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Unique Value</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{idea.uniqueValue}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border/50 bg-background">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Target Persona</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{idea.targetPersona}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border/50 bg-background">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Monetization</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{idea.monetization}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border/50 bg-background">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Tech Stack</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {idea.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {idea.keyFeatures.map((feature, i) => {
                        const Icon = getIcon(feature.icon);
                        return (
                          <div
                            key={i}
                            className="p-3 rounded-lg border border-border/50 bg-background flex gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{feature.title}</h4>
                              <p className="text-xs text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="landing" className="mt-0">
                  {/* Landing Page Preview */}
                  <div className="rounded-xl overflow-hidden border border-border/50 bg-background">
                    {/* Hero */}
                    <div
                      className={`p-8 md:p-12 text-center bg-gradient-to-br ${idea.landingPage.gradient || "from-primary to-primary/70"} text-white`}
                    >
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-bold mb-4"
                      >
                        {idea.landingPage.hero.headline}
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/80 mb-6 max-w-2xl mx-auto"
                      >
                        {idea.landingPage.hero.subheadline}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                          {idea.landingPage.hero.ctaText}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Features Section */}
                    <div className="p-8 md:p-12">
                      <h2 className="text-xl font-semibold text-center mb-8">
                        Everything you need to succeed
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {idea.landingPage.features.map((feature, i) => {
                          const Icon = getIcon(feature.icon);
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-center p-4"
                            >
                              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <h3 className="font-medium mb-2">{feature.title}</h3>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="p-8 md:p-12 bg-muted/30 border-t border-border/50">
                      <div className="max-w-2xl mx-auto text-center">
                        <div className="flex justify-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                          ))}
                        </div>
                        <blockquote className="text-lg italic mb-4">
                          "{idea.landingPage.testimonial.quote}"
                        </blockquote>
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                            {idea.landingPage.testimonial.avatar}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {idea.landingPage.testimonial.author}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-6">
                <Button variant="outline" onClick={generateIdea} disabled={isGenerating}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveIdea} disabled={createSolution.isPending}>
                    {createSolution.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Check className="h-4 w-4 mr-2" />
                    Save to Solutions Lab
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
