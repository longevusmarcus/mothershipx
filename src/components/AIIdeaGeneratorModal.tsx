import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowUpRight, Sparkles, Building2, Users, Package, Rocket } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useSolutions } from "@/hooks/useSolutions";
import { cn } from "@/lib/utils";

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
  ideaType?: string;
  ideaLabel?: string;
  name: string;
  tagline: string;
  description: string;
  uniqueValue: string;
  targetPersona: string;
  keyFeatures: Array<{ title: string; description: string }>;
  techStack: string[];
  monetization: string;
  marketFit: number;
  landingPage: {
    hero: {
      headline: string;
      subheadline: string;
      ctaText: string;
    };
    features: Array<{ title: string; description: string }>;
    stats: Array<{ value: string; label: string }>;
    howItWorks: Array<{ step: string; title: string; description: string }>;
    testimonial: {
      quote: string;
      author: string;
      role: string;
    };
    mockupImage?: string;
  };
}

const IDEA_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  digital: Building2,
  community: Users,
  physical: Package,
  futuristic: Rocket,
};

const IDEA_TYPE_COLORS: Record<string, string> = {
  digital: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  community: "bg-green-500/10 text-green-500 border-green-500/20",
  physical: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  futuristic: "bg-purple-500/10 text-purple-500 border-purple-500/20",
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
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const { createSolution } = useSolutions(problemId);

  const selectedIdea = ideas[selectedIdeaIndex] || null;

  const generateIdeas = async () => {
    setIsGenerating(true);
    setIdeas([]);
    setSelectedIdeaIndex(0);

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

      // Handle both old (single idea) and new (multiple ideas) response format
      if (data?.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
        toast.success(`Generated ${data.ideas.length} diverse ideas`);
      } else if (data?.idea) {
        setIdeas([data.idea]);
        toast.success("Idea generated");
      } else {
        throw new Error(data?.error || "Failed to generate ideas");
      }
    } catch (err) {
      console.error("Error generating ideas:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate ideas");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdea = () => {
    if (!selectedIdea) return;

    const approach = `## Idea Type
${selectedIdea.ideaLabel || 'Digital Product'}

## Unique Value
${selectedIdea.uniqueValue}

## Target Persona
${selectedIdea.targetPersona}

## Key Features
${selectedIdea.keyFeatures.map((f) => `- **${f.title}**: ${f.description}`).join("\n")}

## Tech Stack / Resources
${selectedIdea.techStack.join(", ")}

## Monetization
${selectedIdea.monetization}`;

    createSolution.mutate(
      {
        title: selectedIdea.name,
        description: selectedIdea.description,
        approach,
        techStack: selectedIdea.techStack,
        marketFit: selectedIdea.marketFit || 0,
        landingPage: selectedIdea.landingPage,
      },
      {
        onSuccess: () => {
          toast.success("Idea saved to Solutions Lab");
          onOpenChange(false);
        },
      }
    );
  };

  const getIdeaIcon = (type?: string) => {
    const Icon = IDEA_TYPE_ICONS[type || "digital"] || Sparkles;
    return Icon;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Idea Generator
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {ideas.length === 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-light tracking-tight mb-3">
                  Generate Diverse Ideas
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  AI will generate 3-4 unique ideas across different categories:
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span className="text-xs">Digital Products</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-xs">Communities</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Package className="h-4 w-4 text-orange-500" />
                    <span className="text-xs">Physical Goods</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Rocket className="h-4 w-4 text-purple-500" />
                    <span className="text-xs">Futuristic Tech</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mb-10">
                  <span>{problemCategory}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{opportunityScore}% opportunity</span>
                  {demandVelocity && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{demandVelocity}% demand</span>
                    </>
                  )}
                </div>
                <Button 
                  onClick={generateIdeas} 
                  size="lg" 
                  className="px-8 h-12 text-sm font-normal"
                >
                  Generate Ideas
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center"
            >
              <div className="w-8 h-8 mx-auto mb-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Generating diverse ideas...
              </p>
              <p className="text-xs text-muted-foreground/60">
                This may take 20-30 seconds
              </p>
            </motion.div>
          )}

          {ideas.length > 0 && selectedIdea && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Idea Selector */}
              {ideas.length > 1 && (
                <div className="px-6 pt-4 pb-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    Select an idea ({ideas.length} generated)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ideas.map((idea, idx) => {
                      const Icon = getIdeaIcon(idea.ideaType);
                      const colorClass = IDEA_TYPE_COLORS[idea.ideaType || "digital"] || IDEA_TYPE_COLORS.digital;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedIdeaIndex(idx)}
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all",
                            selectedIdeaIndex === idx
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border/50 hover:border-border"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={cn("p-1 rounded", colorClass)}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {idea.ideaLabel || "Digital"}
                            </span>
                          </div>
                          <p className="text-xs font-medium truncate">{idea.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-4">
                  <TabsList className="w-full h-11 p-1 bg-muted/30">
                    <TabsTrigger value="overview" className="flex-1 text-sm font-normal">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="landing" className="flex-1 text-sm font-normal">
                      Landing Page
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="p-6 pt-6 mt-0 space-y-8">
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl font-light tracking-tight">{selectedIdea.name}</h2>
                          {selectedIdea.ideaLabel && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] font-normal", IDEA_TYPE_COLORS[selectedIdea.ideaType || "digital"])}
                            >
                              {selectedIdea.ideaLabel}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{selectedIdea.tagline}</p>
                      </div>
                      <Badge variant="outline" className="text-xs font-normal shrink-0">
                        {selectedIdea.marketFit}% fit
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {selectedIdea.description}
                    </p>
                  </div>

                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Unique Value
                      </p>
                      <p className="text-sm leading-relaxed">{selectedIdea.uniqueValue}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Target Persona
                      </p>
                      <p className="text-sm leading-relaxed">{selectedIdea.targetPersona}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Monetization
                      </p>
                      <p className="text-sm leading-relaxed">{selectedIdea.monetization}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Tech Stack / Resources
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedIdea.techStack.map((tech) => (
                          <span 
                            key={tech} 
                            className="text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                      Key Features
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedIdea.keyFeatures.map((feature, i) => (
                        <div key={i} className="p-4 rounded-lg border border-border/50">
                          <p className="text-sm font-medium mb-1">{feature.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="landing" className="mt-0">
                  {/* Landing Page Preview */}
                  <div className="bg-background">
                    {/* Hero Section */}
                    <section className="relative px-6 py-16 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
                      <div className="relative max-w-2xl mx-auto text-center">
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl font-light tracking-tight mb-4 leading-[1.1]"
                        >
                          {selectedIdea.landingPage.hero.headline}
                        </motion.h1>
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
                        >
                          {selectedIdea.landingPage.hero.subheadline}
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center justify-center gap-3"
                        >
                          <Button size="default" className="h-10 px-6 text-sm font-normal">
                            {selectedIdea.landingPage.hero.ctaText}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                          <Button variant="ghost" size="default" className="h-10 px-4 text-sm font-normal">
                            Learn more
                          </Button>
                        </motion.div>
                      </div>
                    </section>

                    {/* Product Mockup */}
                    {selectedIdea.landingPage.mockupImage && (
                      <section className="px-6 pb-8">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="max-w-2xl mx-auto"
                        >
                          <div className="rounded-lg overflow-hidden border border-border/50 shadow-2xl">
                            <img 
                              src={selectedIdea.landingPage.mockupImage} 
                              alt={`${selectedIdea.name} product mockup`}
                              className="w-full h-auto"
                            />
                          </div>
                        </motion.div>
                      </section>
                    )}

                    {/* Stats Section */}
                    <section className="px-6 py-12 border-y border-border/50">
                      <div className="max-w-2xl mx-auto">
                        <div className="grid grid-cols-3 gap-6">
                          {(selectedIdea.landingPage.stats || [
                            { value: "10x", label: "Faster" },
                            { value: "90%", label: "Satisfaction" },
                            { value: "24/7", label: "Available" }
                          ]).map((stat, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-center"
                            >
                              <p className="text-2xl font-light tracking-tight mb-0.5">
                                {stat.value}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {stat.label}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Features Section */}
                    <section className="px-6 py-14">
                      <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                            Features
                          </p>
                          <h2 className="text-xl font-light tracking-tight">
                            Everything you need
                          </h2>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          {(selectedIdea.landingPage.features || selectedIdea.keyFeatures.slice(0, 3)).map((feature, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-center"
                            >
                              <div className="w-9 h-9 mx-auto mb-3 rounded-full border border-border/50 flex items-center justify-center">
                                <span className="text-[10px] text-muted-foreground">
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                              </div>
                              <h3 className="text-xs font-medium mb-1.5">{feature.title}</h3>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {feature.description}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* How It Works Section */}
                    <section className="px-6 py-14 bg-muted/20">
                      <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                            Process
                          </p>
                          <h2 className="text-xl font-light tracking-tight">
                            How it works
                          </h2>
                        </div>
                        <div className="space-y-5">
                          {(selectedIdea.landingPage.howItWorks || [
                            { step: "1", title: "Sign Up", description: "Create your free account in seconds" },
                            { step: "2", title: "Configure", description: "Set up your preferences and connect your tools" },
                            { step: "3", title: "Launch", description: "Start seeing results immediately" }
                          ]).map((step, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex gap-4 items-start"
                            >
                              <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] shrink-0">
                                {step.step}
                              </div>
                              <div className="pt-0.5">
                                <h3 className="text-xs font-medium mb-0.5">{step.title}</h3>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Testimonial Section */}
                    <section className="px-6 py-14 border-t border-border/50">
                      <div className="max-w-xl mx-auto text-center">
                        <blockquote className="text-base font-light leading-relaxed mb-4 italic">
                          "{selectedIdea.landingPage.testimonial?.quote || 'This product completely transformed how I work.'}"
                        </blockquote>
                        <div>
                          <p className="text-xs font-medium">
                            {selectedIdea.landingPage.testimonial?.author || 'Alex Chen'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectedIdea.landingPage.testimonial?.role || 'Early Adopter'}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* CTA Section */}
                    <section className="px-6 py-14 bg-foreground text-background">
                      <div className="max-w-xl mx-auto text-center">
                        <h2 className="text-xl font-light tracking-tight mb-3">
                          Ready to get started?
                        </h2>
                        <p className="text-xs text-background/60 mb-6">
                          Join thousands of users transforming their workflow.
                        </p>
                        <Button 
                          variant="secondary" 
                          size="default" 
                          className="h-10 px-6 text-sm font-normal"
                        >
                          {selectedIdea.landingPage.hero.ctaText}
                          <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </section>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex items-center justify-between p-6 border-t border-border/50 bg-muted/20">
                <Button 
                  variant="ghost" 
                  onClick={generateIdeas} 
                  disabled={isGenerating}
                  className="text-sm font-normal"
                >
                  Regenerate All
                </Button>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="text-sm font-normal"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveIdea} 
                    disabled={createSolution.isPending}
                    className="text-sm font-normal"
                  >
                    {createSolution.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save "{selectedIdea.name}"
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
