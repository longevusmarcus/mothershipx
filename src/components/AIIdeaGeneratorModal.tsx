import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowRight, ArrowUpRight, Circle } from "lucide-react";
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
      toast.success("Idea generated");
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
        marketFit: idea.marketFit || 0,
      },
      {
        onSuccess: () => {
          toast.success("Idea saved to Solutions Lab");
          onOpenChange(false);
        },
      }
    );
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
          {!idea && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-light tracking-tight mb-3">
                  Generate Product Idea
                </h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  AI will analyze the problem context, market signals, and competition 
                  to create a unique, actionable product concept.
                </p>
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
                  onClick={generateIdea} 
                  size="lg" 
                  className="px-8 h-12 text-sm font-normal"
                >
                  Generate
                  <ArrowRight className="h-4 w-4 ml-2" />
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
              <p className="text-sm text-muted-foreground">
                Analyzing market signals...
              </p>
            </motion.div>
          )}

          {idea && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                        <h2 className="text-2xl font-light tracking-tight mb-2">{idea.name}</h2>
                        <p className="text-muted-foreground">{idea.tagline}</p>
                      </div>
                      <Badge variant="outline" className="text-xs font-normal shrink-0">
                        AI Generated
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>

                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Unique Value
                      </p>
                      <p className="text-sm leading-relaxed">{idea.uniqueValue}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Target Persona
                      </p>
                      <p className="text-sm leading-relaxed">{idea.targetPersona}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Monetization
                      </p>
                      <p className="text-sm leading-relaxed">{idea.monetization}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Tech Stack
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {idea.techStack.map((tech) => (
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
                      {idea.keyFeatures.map((feature, i) => (
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
                          {idea.landingPage.hero.headline}
                        </motion.h1>
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
                        >
                          {idea.landingPage.hero.subheadline}
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center justify-center gap-3"
                        >
                          <Button size="default" className="h-10 px-6 text-sm font-normal">
                            {idea.landingPage.hero.ctaText}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                          <Button variant="ghost" size="default" className="h-10 px-4 text-sm font-normal">
                            Learn more
                          </Button>
                        </motion.div>
                      </div>
                    </section>

                    {/* Product Mockup */}
                    {idea.landingPage.mockupImage && (
                      <section className="px-6 pb-8">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="max-w-2xl mx-auto"
                        >
                          <div className="rounded-lg overflow-hidden border border-border/50 shadow-2xl">
                            <img 
                              src={idea.landingPage.mockupImage} 
                              alt={`${idea.name} product mockup`}
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
                          {(idea.landingPage.stats || [
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
                          {(idea.landingPage.features || idea.keyFeatures.slice(0, 3)).map((feature, i) => (
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
                          {(idea.landingPage.howItWorks || [
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
                          "{idea.landingPage.testimonial?.quote || 'This product completely transformed how I work.'}"
                        </blockquote>
                        <div>
                          <p className="text-xs font-medium">
                            {idea.landingPage.testimonial?.author || 'Alex Chen'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {idea.landingPage.testimonial?.role || 'Early Adopter'}
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
                          {idea.landingPage.hero.ctaText}
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
                  onClick={generateIdea} 
                  disabled={isGenerating}
                  className="text-sm font-normal"
                >
                  Regenerate
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
