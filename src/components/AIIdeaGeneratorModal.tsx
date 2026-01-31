import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, ArrowUpRight } from "lucide-react";
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

const IDEA_CATEGORIES = [
  { type: "reallife", label: "Real-Life", abbr: "01" },
  { type: "digital", label: "Digital", abbr: "02" },
  { type: "community", label: "Community", abbr: "03" },
  { type: "physical", label: "Physical", abbr: "04" },
  { type: "futuristic", label: "Futuristic", abbr: "05" },
];

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

      if (data?.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
        toast.success(`Generated ${data.ideas.length} ideas`);
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

  const [isSavingAll, setIsSavingAll] = useState(false);

  const buildApproach = (idea: GeneratedIdea) => `## Idea Type
${idea.ideaLabel || 'Digital Product'}

## Unique Value
${idea.uniqueValue}

## Target Persona
${idea.targetPersona}

## Key Features
${idea.keyFeatures.map((f) => `- **${f.title}**: ${f.description}`).join("\n")}

## Tech Stack / Resources
${idea.techStack.join(", ")}

## Monetization
${idea.monetization}`;

  const saveAllIdeas = async () => {
    if (ideas.length === 0) return;
    
    setIsSavingAll(true);
    let savedCount = 0;
    
    try {
      for (const idea of ideas) {
        await new Promise<void>((resolve, reject) => {
          createSolution.mutate(
            {
              title: idea.name,
              description: idea.description,
              approach: buildApproach(idea),
              techStack: idea.techStack,
              marketFit: idea.marketFit || 0,
              landingPage: idea.landingPage,
            },
            {
              onSuccess: () => {
                savedCount++;
                resolve();
              },
              onError: (error) => {
                reject(error);
              },
            }
          );
        });
      }
      
      toast.success(`${savedCount} ideas saved to Solutions Lab`);
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving ideas:", err);
      toast.error(`Saved ${savedCount} ideas, but some failed`);
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 border-border/40">
        <DialogHeader className="p-6 pb-4 border-b border-border/30">
          <DialogTitle className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/60">
            ./generate
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {ideas.length === 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center"
            >
              <div className="max-w-lg mx-auto">
                {/* Minimal header */}
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/50 mb-4">
                  Idea Generation
                </p>
                <h3 className="text-3xl font-light tracking-tight mb-3">
                  What will you build?
                </h3>
                <p className="text-sm text-muted-foreground/70 mb-12 leading-relaxed max-w-sm mx-auto">
                  Generate 3–4 distinct concepts across digital, physical, community, and emerging tech.
                </p>
                
                {/* Elegant category display */}
                <div className="flex items-center justify-center gap-8 mb-12">
                  {IDEA_CATEGORIES.map((cat, i) => (
                    <motion.div
                      key={cat.type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-center"
                    >
                      <p className="text-[10px] font-mono text-muted-foreground/40 mb-1">
                        {cat.abbr}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {cat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Context stats */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground/50 mb-12">
                  <span className="font-mono">{problemCategory}</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span className="font-mono">{opportunityScore}% opp</span>
                  {demandVelocity && (
                    <>
                      <span className="w-px h-3 bg-border/50" />
                      <span className="font-mono">{demandVelocity}% vel</span>
                    </>
                  )}
                </div>

                {/* Clean CTA button */}
                <Button 
                  onClick={generateIdeas} 
                  variant="outline"
                  size="lg" 
                  className="h-12 px-10 text-sm font-normal border-border/50 hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Generate
                  <ArrowRight className="h-4 w-4 ml-3" />
                </Button>
              </div>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-20 text-center"
            >
              <div className="relative w-6 h-6 mx-auto mb-8">
                <motion.div
                  className="absolute inset-0 border border-foreground/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-1 border-t border-foreground/60 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-xs font-mono text-muted-foreground/60 tracking-wider">
                Generating...
              </p>
            </motion.div>
          )}

          {ideas.length > 0 && selectedIdea && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Idea Selector - Minimal Design */}
              {ideas.length > 1 && (
                <div className="px-6 pt-6 pb-2 border-b border-border/30">
                  <div className="flex items-center gap-1">
                    {ideas.map((idea, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIdeaIndex(idx)}
                        className={cn(
                          "px-4 py-2.5 text-xs transition-all duration-200 border-b-2 -mb-[1px]",
                          selectedIdeaIndex === idx
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted-foreground/60 hover:text-muted-foreground"
                        )}
                      >
                        <span className="font-mono text-[10px] text-muted-foreground/40 mr-2">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {idea.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-5">
                  <TabsList className="w-auto h-8 p-0.5 bg-muted/20 gap-0.5">
                    <TabsTrigger value="overview" className="h-7 px-4 text-xs font-normal data-[state=active]:bg-background">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="landing" className="h-7 px-4 text-xs font-normal data-[state=active]:bg-background">
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="p-6 pt-6 mt-0 space-y-8">
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-light tracking-tight">{selectedIdea.name}</h2>
                          {selectedIdea.ideaLabel && (
                            <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50 uppercase">
                              {selectedIdea.ideaLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground/80">{selectedIdea.tagline}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-light tracking-tight">{selectedIdea.marketFit}</p>
                        <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">fit score</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed">
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

              {/* Actions - Refined Footer */}
              <div className="flex items-center justify-between p-5 border-t border-border/30">
                <button 
                  onClick={generateIdeas} 
                  disabled={isGenerating}
                  className="text-xs font-mono text-muted-foreground/60 hover:text-foreground transition-colors disabled:opacity-40"
                >
                  ./regenerate
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => onOpenChange(false)}
                    className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <Button 
                    onClick={saveAllIdeas} 
                    disabled={isSavingAll}
                    size="sm"
                    className="h-9 px-5 text-xs font-normal"
                  >
                    {isSavingAll ? (
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : null}
                    Save All Ideas
                    <ArrowRight className="h-3 w-3 ml-2" />
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
