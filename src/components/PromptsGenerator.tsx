import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
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
  Settings2,
  Smartphone,
  Globe,
  Chrome,
  Monitor,
  Cpu,
  Shield,
  CreditCard,
  Mail,
  BarChart3,
  Users,
  Bot,
  Palette,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface PromptConfig {
  framework: string;
  complexity: number;
  features: {
    auth: boolean;
    payments: boolean;
    analytics: boolean;
    email: boolean;
    admin: boolean;
    ai: boolean;
    realtime: boolean;
    darkMode: boolean;
  };
  techStack: string[];
  designStyle: string;
}

const frameworks = [
  { id: "lovable", name: "Lovable (React + Vite)", icon: Rocket, description: "Modern React SPA" },
  { id: "nextjs", name: "Next.js", icon: Globe, description: "Full-stack React framework" },
  { id: "mobile-react-native", name: "React Native", icon: Smartphone, description: "Cross-platform mobile" },
  { id: "mobile-flutter", name: "Flutter", icon: Smartphone, description: "Cross-platform mobile" },
  { id: "chrome-extension", name: "Chrome Extension", icon: Chrome, description: "Browser extension" },
  { id: "desktop-electron", name: "Electron", icon: Monitor, description: "Desktop application" },
  { id: "api-only", name: "API Backend", icon: Cpu, description: "Backend service only" },
];

const techStackOptions = [
  { id: "supabase", name: "Supabase", category: "Backend" },
  { id: "firebase", name: "Firebase", category: "Backend" },
  { id: "prisma", name: "Prisma + PostgreSQL", category: "Backend" },
  { id: "mongodb", name: "MongoDB", category: "Backend" },
  { id: "tailwind", name: "Tailwind CSS", category: "Styling" },
  { id: "shadcn", name: "shadcn/ui", category: "Components" },
  { id: "framer", name: "Framer Motion", category: "Animations" },
  { id: "stripe", name: "Stripe", category: "Payments" },
  { id: "clerk", name: "Clerk", category: "Auth" },
  { id: "resend", name: "Resend", category: "Email" },
  { id: "openai", name: "OpenAI", category: "AI" },
];

const designStyles = [
  { id: "minimal", name: "Minimal & Clean", description: "Simple, focused UI" },
  { id: "modern", name: "Modern SaaS", description: "Professional, polished look" },
  { id: "playful", name: "Playful & Bold", description: "Vibrant colors, fun animations" },
  { id: "dark-luxe", name: "Dark Luxe", description: "Dark mode first, premium feel" },
  { id: "brutalist", name: "Brutalist", description: "Raw, unconventional design" },
  { id: "glassmorphism", name: "Glassmorphism", description: "Frosted glass effects" },
];

const featureOptions = [
  { id: "auth", name: "Authentication", icon: Shield, description: "User signup/login" },
  { id: "payments", name: "Payments", icon: CreditCard, description: "Stripe integration" },
  { id: "analytics", name: "Analytics", icon: BarChart3, description: "Usage tracking" },
  { id: "email", name: "Email", icon: Mail, description: "Transactional emails" },
  { id: "admin", name: "Admin Dashboard", icon: Users, description: "User management" },
  { id: "ai", name: "AI Features", icon: Bot, description: "LLM integration" },
  { id: "realtime", name: "Real-time", icon: Zap, description: "Live updates" },
  { id: "darkMode", name: "Dark Mode", icon: Palette, description: "Theme switching" },
];

const promptIcons = {
  mvp: Rocket,
  fullstack: Layers,
  differentiator: Lightbulb,
};

const promptColors = {
  mvp: "from-success/20 to-success/10 border-success/30",
  fullstack: "from-primary/20 to-primary/10 border-primary/30",
  differentiator: "from-accent/20 to-accent/10 border-accent/30",
};

const promptAccents = {
  mvp: "text-success",
  fullstack: "text-primary",
  differentiator: "text-accent-foreground",
};

const defaultConfig: PromptConfig = {
  framework: "lovable",
  complexity: 3,
  features: {
    auth: true,
    payments: false,
    analytics: false,
    email: false,
    admin: false,
    ai: false,
    realtime: false,
    darkMode: true,
  },
  techStack: ["supabase", "tailwind", "shadcn"],
  designStyle: "modern",
};

export function PromptsGenerator({ problem, competitors, solutions }: PromptsGeneratorProps) {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<PromptConfig>(defaultConfig);

  const updateFeature = (feature: keyof PromptConfig["features"], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: value }
    }));
  };

  const toggleTechStack = (tech: string) => {
    setConfig(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const generatePrompts = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-prompts", {
        body: { problem, competitors, solutions, config },
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

  const selectedFramework = frameworks.find(f => f.id === config.framework);
  const enabledFeatures = Object.entries(config.features).filter(([_, v]) => v).length;

  if (prompts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-secondary/20 p-6"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-2xl" />
              </div>
              <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center">
                <Terminal className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Senior Prompt Engineering</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Generate production-ready prompts with custom framework and feature preferences.
              </p>
            </div>
          </div>

          {/* Configuration Panel */}
          <Collapsible open={showConfig} onOpenChange={setShowConfig}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Customize Generation
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedFramework?.name}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {enabledFeatures} features
                  </Badge>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    showConfig && "rotate-180"
                  )} />
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-4 space-y-6">
              {/* Framework Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Framework / Platform
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {frameworks.map((fw) => {
                    const Icon = fw.icon;
                    const isSelected = config.framework === fw.id;
                    return (
                      <button
                        key={fw.id}
                        onClick={() => setConfig(prev => ({ ...prev, framework: fw.id }))}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-secondary/50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                          <span className="text-xs font-medium truncate">{fw.name}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{fw.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complexity Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Target Complexity
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {config.complexity === 1 && "Weekend Project"}
                    {config.complexity === 2 && "MVP"}
                    {config.complexity === 3 && "Production Ready"}
                    {config.complexity === 4 && "Enterprise"}
                    {config.complexity === 5 && "Full Platform"}
                  </Badge>
                </div>
                <Slider
                  value={[config.complexity]}
                  onValueChange={([v]) => setConfig(prev => ({ ...prev, complexity: v }))}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Simple</span>
                  <span>Complex</span>
                </div>
              </div>

              {/* Features Toggle */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Features to Include
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {featureOptions.map((feature) => {
                    const Icon = feature.icon;
                    const isEnabled = config.features[feature.id as keyof PromptConfig["features"]];
                    return (
                      <button
                        key={feature.id}
                        onClick={() => updateFeature(feature.id as keyof PromptConfig["features"], !isEnabled)}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all",
                          isEnabled
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-3.5 w-3.5", isEnabled ? "text-primary" : "text-muted-foreground")} />
                          <span className="text-xs font-medium">{feature.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Preferred Tech Stack
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {techStackOptions.map((tech) => {
                    const isSelected = config.techStack.includes(tech.id);
                    return (
                      <Badge
                        key={tech.id}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all text-xs",
                          isSelected ? "" : "hover:bg-secondary"
                        )}
                        onClick={() => toggleTechStack(tech.id)}
                      >
                        {tech.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Design Style */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Design Style
                </Label>
                <Select
                  value={config.designStyle}
                  onValueChange={(v) => setConfig(prev => ({ ...prev, designStyle: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {designStyles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        <div className="flex flex-col">
                          <span>{style.name}</span>
                          <span className="text-xs text-muted-foreground">{style.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Generate Button */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500" />
            <Button
              onClick={generatePrompts}
              disabled={isGenerating}
              size="lg"
              className="relative w-full bg-foreground text-background hover:bg-foreground/90 border-0 shadow-lg transition-all duration-300 group-hover:shadow-primary/20 group-hover:shadow-xl"
            >
              <span className="flex items-center gap-2.5">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Custom Prompts...
                  </>
                ) : (
                  <>
                    <Terminal className="h-4 w-4" />
                    Generate Expert Prompts
                  </>
                )}
              </span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            AI analyzes the problem + your preferences to craft 3 unique approaches
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
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Code2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Generated Prompts</h3>
            <p className="text-xs text-muted-foreground">
              {selectedFramework?.name} • {enabledFeatures} features • {designStyles.find(s => s.id === config.designStyle)?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPrompts([]);
              setShowConfig(true);
            }}
            className="text-xs"
          >
            <Settings2 className="h-3 w-3 mr-1" />
            Reconfigure
          </Button>
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
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Regenerate
          </Button>
        </div>
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
                  className="w-full p-4 flex items-start justify-between text-left hover:bg-background/5 transition-colors"
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
                                i < prompt.complexity ? "bg-primary" : "bg-muted"
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
