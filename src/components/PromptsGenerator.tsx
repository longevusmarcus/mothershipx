import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Layers, 
  Lightbulb,
  Clock,
  ChevronDown,
  ChevronUp,
  Terminal,
  Rocket,
  Code2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

interface Prompt {
  id: string;
  title: string;
  subtitle: string;
  complexity: number;
  estimatedTime: string;
  differentiators: string[];
  tags: string[];
  prompt: string;
}

interface PromptsGeneratorProps {
  problem: {
    id: string;
    title: string;
    subtitle?: string;
    category: string;
    niche: string;
    painPoints?: string[];
    marketSize?: string;
    opportunityScore: number;
    sentiment: string;
    sources?: any[];
    hiddenInsight?: any;
  };
  competitors?: any[];
  solutions?: any[];
}

const promptIcons = {
  mvp: Rocket,
  fullstack: Layers,
  differentiator: Lightbulb,
};

const promptColors = {
  mvp: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  fullstack: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
  differentiator: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
};

const promptAccents = {
  mvp: "text-emerald-500",
  fullstack: "text-blue-500",
  differentiator: "text-purple-500",
};

export function PromptsGenerator({ problem, competitors, solutions }: PromptsGeneratorProps) {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generatePrompts = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-prompts", {
        body: { problem, competitors, solutions },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.prompts) {
        setPrompts(data.prompts);
        setExpandedPrompt(data.prompts[0]?.id || null);
      }
    } catch (err) {
      console.error("Failed to generate prompts:", err);
      setError(err instanceof Error ? err.message : "Failed to generate prompts");
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate prompts",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopiedId(prompt.id);
      toast({
        title: "Copied to clipboard",
        description: "Paste this prompt into Lovable or your favorite AI tool",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please select and copy the text manually",
        variant: "destructive",
      });
    }
  };

  const getPromptIcon = (id: string) => {
    if (id.includes("mvp") || id === "0") return promptIcons.mvp;
    if (id.includes("full") || id === "1") return promptIcons.fullstack;
    return promptIcons.differentiator;
  };

  const getPromptColor = (id: string) => {
    if (id.includes("mvp") || id === "0") return promptColors.mvp;
    if (id.includes("full") || id === "1") return promptColors.fullstack;
    return promptColors.differentiator;
  };

  const getPromptAccent = (id: string) => {
    if (id.includes("mvp") || id === "0") return promptAccents.mvp;
    if (id.includes("full") || id === "1") return promptAccents.fullstack;
    return promptAccents.differentiator;
  };

  if (prompts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-secondary/20 p-8"
      >
        <div className="text-center space-y-6">
          {/* Hero section */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center mb-4">
                <Terminal className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Senior Prompt Engineering
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Generate production-ready prompts crafted by AI with 15+ years of simulated expertise. 
              Each prompt includes design systems, database schemas, and edge case handling.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Design Systems", "Database Schemas", "Auth Flows", "Edge Cases", "Accessibility"].map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-destructive text-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}

          <Button
            onClick={generatePrompts}
            disabled={isGenerating}
            size="lg"
            className="relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Prompts...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Expert Prompts
                </>
              )}
            </span>
          </Button>

          <p className="text-xs text-muted-foreground">
            Uses Gemini 3 Flash to analyze the problem and generate 3 unique approaches
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Code2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Generated Prompts</h3>
            <p className="text-xs text-muted-foreground">Click to expand, copy to use</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generatePrompts}
          disabled={isGenerating}
          className="text-xs"
        >
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Sparkles className="h-3 w-3 mr-1" />
          )}
          Regenerate
        </Button>
      </div>

      {/* Prompts list */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {prompts.map((prompt, index) => {
            const Icon = getPromptIcon(prompt.id || String(index));
            const colorClass = getPromptColor(prompt.id || String(index));
            const accentClass = getPromptAccent(prompt.id || String(index));
            const isExpanded = expandedPrompt === prompt.id;

            return (
              <motion.div
                key={prompt.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-xl border bg-gradient-to-br overflow-hidden",
                  colorClass
                )}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedPrompt(isExpanded ? null : prompt.id)}
                  className="w-full p-4 flex items-start justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg bg-background/50", accentClass)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{prompt.title}</h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                i < prompt.complexity ? accentClass.replace("text-", "bg-") : "bg-muted"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {prompt.subtitle}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {prompt.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {prompt.complexity}/5 complexity
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPrompt(prompt);
                      }}
                      className="h-8"
                    >
                      {copiedId === prompt.id ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {prompt.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Differentiators */}
                        {prompt.differentiators?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Key Differentiators
                            </p>
                            <ul className="space-y-1">
                              {prompt.differentiators.map((diff, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <Check className={cn("h-3 w-3 mt-0.5 shrink-0", accentClass)} />
                                  <span>{diff}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Prompt text */}
                        <div className="relative">
                          <div className="absolute top-2 right-2 z-10">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => copyPrompt(prompt)}
                              className="h-7 text-xs"
                            >
                              {copiedId === prompt.id ? (
                                <>
                                  <Check className="h-3 w-3 mr-1 text-success" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy Prompt
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="rounded-lg bg-background/80 backdrop-blur border border-border/50 p-4 max-h-80 overflow-y-auto">
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                              {prompt.prompt}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
