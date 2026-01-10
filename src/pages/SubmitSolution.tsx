import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ExternalLink, 
  Github, 
  CreditCard, 
  Database, 
  Rocket,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
  Target,
  Users,
  Zap,
  Trophy,
  Clock,
  DollarSign,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FitVerificationPanel } from "@/components/FitVerificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Validation schema
const submissionSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(50, "Product name must be less than 50 characters"),
  productUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .max(200, "URL must be less than 200 characters"),
  demoUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .max(200, "URL must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  githubRepo: z
    .string()
    .trim()
    .max(200, "URL must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  stripePublicKey: z
    .string()
    .trim()
    .max(100, "Key must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  supabaseProjectUrl: z
    .string()
    .trim()
    .max(200, "URL must be less than 200 characters")
    .optional()
    .or(z.literal("")),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface ChallengeContext {
  id: string;
  title: string;
  trend: string;
  description: string;
  example: string;
  prizePool: number;
  winnerPrize: number;
  endsAt: string;
  difficulty: string;
  tags: string[];
}

interface LocationState {
  challenge?: ChallengeContext;
  joinType?: "solo" | "team";
  entryFee?: number;
}

interface SubmissionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

interface AIGeneratedData {
  problemStatement: string;
  solutionNarrative: string;
  uniqueValue: string;
  targetPersona: string;
  gtmStrategy: string;
  pricingModel: string;
}

interface FitVerificationData {
  sentimentFitScore: number;
  problemCoverage: number;
  adoptionVelocity: number;
  revenuePresent: boolean;
  revenueAmount?: string;
  buildMomentum: number;
  misalignments: string[];
}

const SubmitSolution = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const state = location.state as LocationState | null;
  const challenge = state?.challenge;
  const joinType = state?.joinType;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiGeneratedData, setAiGeneratedData] = useState<AIGeneratedData | null>(null);
  const [fitVerificationData, setFitVerificationData] = useState<FitVerificationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      productName: "",
      productUrl: "",
      demoUrl: "",
      githubRepo: "",
      stripePublicKey: "",
      supabaseProjectUrl: "",
    },
    mode: "onBlur",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your solution.",
        variant: "destructive",
      });
      navigate("/auth", { state: { returnTo: "/submit" } });
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  // Calculate time remaining for challenge
  const getTimeRemaining = () => {
    if (!challenge?.endsAt) return null;
    const now = new Date();
    const endsAt = new Date(challenge.endsAt);
    const diff = endsAt.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const steps: SubmissionStep[] = [
    { id: "integrations", title: "Connect Sources", description: "Product URL & integrations", icon: Database, completed: currentStep > 0 },
    { id: "analysis", title: "AI Analysis", description: "Generating narrative & GTM", icon: Sparkles, completed: currentStep > 1 },
    { id: "verification", title: "Fit Verification", description: "Problem-solution fit score", icon: Target, completed: currentStep > 2 },
  ];

  const simulateAIAnalysis = async (data: SubmissionFormData) => {
    setIsAnalyzing(true);
    setCurrentStep(1);
    
    const progressSteps = [
      { progress: 15, delay: 500 },
      { progress: 35, delay: 800 },
      { progress: 55, delay: 600 },
      { progress: 75, delay: 700 },
      { progress: 90, delay: 500 },
      { progress: 100, delay: 400 },
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setAnalysisProgress(step.progress);
    }

    const productName = data.productName || "Your Product";
    const challengeContext = challenge 
      ? ` addressing the "${challenge.trend}" trend` 
      : "";
    
    setAiGeneratedData({
      problemStatement: `Users struggle with inefficient workflows and manual processes that waste time and reduce productivity. ${productName}${challengeContext} addresses the critical pain point of operational inefficiency in modern teams.`,
      solutionNarrative: `${productName} provides an intelligent automation platform that streamlines repetitive tasks, integrates seamlessly with existing tools, and learns from user behavior to continuously optimize workflows.`,
      uniqueValue: `Unlike generic automation tools, ${productName} uses AI-powered pattern recognition to proactively suggest optimizations and adapts to each team's unique processes.`,
      targetPersona: "Operations managers and team leads at growing tech companies (50-500 employees) who spend 10+ hours weekly on manual coordination tasks.",
      gtmStrategy: "Product-led growth with freemium tier targeting early-stage startups, combined with enterprise sales motion for larger organizations. Focus on Product Hunt launch and LinkedIn thought leadership.",
      pricingModel: "Freemium with Pro at $29/user/mo and Enterprise custom pricing",
    });

    const hasRevenue = (data.stripePublicKey?.length || 0) > 0;
    const hasGithub = (data.githubRepo?.length || 0) > 0;
    const hasSupabase = (data.supabaseProjectUrl?.length || 0) > 0;
    
    const baseScore = 55;
    const integrationBonus = (hasGithub ? 15 : 0) + (hasRevenue ? 15 : 0) + (hasSupabase ? 10 : 0);
    
    const misalignments: string[] = [];
    if (!hasGithub) misalignments.push("No GitHub repository connected - build momentum cannot be verified");
    if (!hasRevenue) misalignments.push("No Stripe integration - revenue signals unavailable");
    if (!hasSupabase) misalignments.push("No Supabase connection - adoption velocity is estimated");

    setFitVerificationData({
      sentimentFitScore: Math.min(95, baseScore + integrationBonus + Math.floor(Math.random() * 15)),
      problemCoverage: Math.min(90, baseScore + Math.floor(Math.random() * 20)),
      adoptionVelocity: hasSupabase ? Math.floor(Math.random() * 150) + 50 : Math.floor(Math.random() * 30) + 10,
      revenuePresent: hasRevenue,
      revenueAmount: hasRevenue ? "$" + (Math.floor(Math.random() * 5000) + 500) + "/mo" : undefined,
      buildMomentum: hasGithub ? Math.min(95, 60 + Math.floor(Math.random() * 35)) : 25,
      misalignments,
    });

    setIsAnalyzing(false);
    setCurrentStep(2);
  };

  const onSubmitForm = async (data: SubmissionFormData) => {
    await simulateAIAnalysis(data);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: challenge ? "Challenge Entry Submitted!" : "Solution Submitted!",
      description: challenge 
        ? `Your entry for "${challenge.title}" is now live. Good luck!`
        : "Your solution is now live on the problem dashboard. Good luck!",
    });
    
    setIsSubmitting(false);
    
    // Navigate back to challenges or home
    navigate(challenge ? "/challenges" : "/");
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(0);
      setAiGeneratedData(null);
      setFitVerificationData(null);
      setAnalysisProgress(0);
    } else if (challenge) {
      navigate("/challenges");
    } else {
      navigate(-1);
    }
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  if (authLoading) {
    return (
      <AppLayout title="Loading...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={challenge ? "Submit Entry" : "New Build"}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <Badge variant="glow" className="mb-2">
            {challenge ? (
              <>
                <Trophy className="h-3 w-3 mr-1" />
                Challenge Entry
              </>
            ) : (
              <>
                <Rocket className="h-3 w-3 mr-1" />
                New Build
              </>
            )}
          </Badge>
          <h1 className="text-2xl font-bold">
            {challenge ? `Submit to "${challenge.title}"` : "Submit Your Solution"}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {challenge 
              ? `Build something amazing for the "${challenge.trend}" trend and compete for $${challenge.winnerPrize.toFixed(0)}!`
              : "Connect your data sources and let AI analyze your problem-solution fit."
            }
          </p>
        </motion.div>

        {/* Challenge Context Banner */}
        {challenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glow" className="border-primary/30">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{challenge.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">
                          {joinType === "solo" ? "Solo" : "Team"}
                        </Badge>
                        <span>•</span>
                        <span className="text-primary font-medium">{challenge.trend}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-success font-bold">
                        <DollarSign className="h-4 w-4" />
                        {challenge.winnerPrize.toFixed(0)}
                      </div>
                      <p className="text-[10px] text-muted-foreground">winner prize</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-warning font-medium text-sm">
                        <Clock className="h-4 w-4" />
                        {getTimeRemaining()}
                      </div>
                      <p className="text-[10px] text-muted-foreground">to submit</p>
                    </div>
                  </div>
                </div>
                
                {/* Example Build Hint */}
                <div className="mt-3 p-3 bg-secondary/50 rounded-lg border border-border/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                    💡 Example Build Idea
                  </p>
                  <p className="text-xs italic">"{challenge.example}"</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-2 ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        index < currentStep 
                          ? 'bg-success text-success-foreground' 
                          : index === currentStep 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary text-muted-foreground'
                      }`}>
                        {index < currentStep ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : index === 1 && isAnalyzing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 lg:w-24 h-0.5 mx-2 ${index < currentStep ? 'bg-success' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={progressValue} size="sm" indicatorColor="gradient" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Connect Your Sources
                  </CardTitle>
                  <CardDescription>
                    Provide your product details and connect data sources for verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
                      {/* Required Fields */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="productName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="OnboardFlow" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="productUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product URL *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="https://onboardflow.app" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="demoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Demo / Video URL (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://loom.com/share/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Integration Fields */}
                      <div className="pt-4 border-t border-border">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Connect Data Sources</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                More integrations = higher verification accuracy & better fit scores
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="githubRepo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Github className="h-4 w-4" />
                                  GitHub Repository
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://github.com/username/repo" 
                                    {...field} 
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Track build momentum & activity</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="stripePublicKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Stripe Publishable Key
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="pk_live_..." {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Verify revenue signals</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="supabaseProjectUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Database className="h-4 w-4" />
                                  Supabase Project URL
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://xyzcompany.supabase.co" 
                                    {...field} 
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Measure adoption velocity</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Button type="button" variant="ghost" onClick={handleBack}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          variant="glow" 
                          disabled={!form.formState.isValid || form.formState.isSubmitting}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze with AI
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 1 && isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glow">
                <CardContent className="py-12">
                  <div className="text-center space-y-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-16 w-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center"
                    >
                      <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">AI Analysis in Progress</h3>
                      <p className="text-muted-foreground">
                        Analyzing your product and generating insights...
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-3">
                      <Progress value={analysisProgress} size="lg" indicatorColor="gradient" />
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant={analysisProgress >= 20 ? "success" : "secondary"} className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Scraping Product
                        </Badge>
                        <Badge variant={analysisProgress >= 45 ? "success" : "secondary"} className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Identifying Persona
                        </Badge>
                        <Badge variant={analysisProgress >= 70 ? "success" : "secondary"} className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Generating GTM
                        </Badge>
                        <Badge variant={analysisProgress >= 90 ? "success" : "secondary"} className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Scoring Fit
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && aiGeneratedData && fitVerificationData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* AI Generated Narrative & GTM */}
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI-Generated Analysis</CardTitle>
                      <CardDescription>Based on your product data</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Problem-Solution Narrative */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Problem → Solution Narrative
                    </h4>
                    <div className="grid gap-3">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Problem Statement</p>
                        <p className="text-sm">{aiGeneratedData.problemStatement}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Solution Narrative</p>
                        <p className="text-sm">{aiGeneratedData.solutionNarrative}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Unique Value Proposition</p>
                        <p className="text-sm">{aiGeneratedData.uniqueValue}</p>
                      </div>
                    </div>
                  </div>

                  {/* Target & GTM */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Target Persona & GTM Strategy
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Target Persona</p>
                        <p className="text-sm">{aiGeneratedData.targetPersona}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Go-to-Market Strategy</p>
                        <p className="text-sm">{aiGeneratedData.gtmStrategy}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Suggested Pricing</p>
                      <p className="text-sm font-medium">{aiGeneratedData.pricingModel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fit Verification Panel */}
              <FitVerificationPanel {...fitVerificationData} />

              {/* Submit Button */}
              <Card variant="elevated">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {challenge ? "Ready to compete?" : "Ready to submit?"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {challenge 
                          ? `Submit your entry for "${challenge.title}"`
                          : "Submit your solution to the problem dashboard"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button variant="outline" onClick={handleBack} className="flex-1 sm:flex-initial">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="glow" 
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-initial"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            {challenge ? "Submit Entry" : "Submit Solution"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default SubmitSolution;
