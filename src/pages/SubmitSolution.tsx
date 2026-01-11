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
  Sparkles,
  Loader2,
  Trophy,
  Clock,
  DollarSign,
  Target,
  Zap,
  Award,
  BarChart3,
  Wallet,
  Mail,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateSubmission } from "@/hooks/useSubmissions";
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
  paymentInfo: z
    .string()
    .trim()
    .max(100, "Payment info must be less than 100 characters")
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

const SubmitSolution = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const createSubmission = useCreateSubmission();
  
  const state = location.state as LocationState | null;
  const challenge = state?.challenge;
  const joinType = state?.joinType || "solo";
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      productName: "",
      productUrl: "",
      demoUrl: "",
      githubRepo: "",
      stripePublicKey: "",
      supabaseProjectUrl: "",
      paymentInfo: "",
    },
    mode: "onBlur",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your entry.",
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
    { id: "details", title: "Build Details", description: "Product URL & integrations", icon: Database, completed: currentStep > 0 },
    { id: "submitting", title: "Submitting", description: "AI validation in progress", icon: Sparkles, completed: currentStep > 1 },
    { id: "confirmed", title: "Confirmed", description: "Entry submitted", icon: CheckCircle2, completed: currentStep > 2 },
  ];

  const handleSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);
    setCurrentStep(1);
    
    // Show progress while submitting to Supabase with AI validation
    const progressInterval = setInterval(() => {
      setSubmissionProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    try {
      await createSubmission.mutateAsync({
        formData: {
          productName: data.productName,
          productUrl: data.productUrl,
          demoUrl: data.demoUrl,
          githubRepo: data.githubRepo,
          stripePublicKey: data.stripePublicKey,
          supabaseProjectUrl: data.supabaseProjectUrl,
          paymentInfo: data.paymentInfo,
        },
        challengeId: challenge?.id,
        joinType: joinType as "solo" | "team",
      });

      clearInterval(progressInterval);
      setSubmissionProgress(100);
      
      // Short delay before showing success
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsSubmitting(false);
      setIsSubmitted(true);
      setCurrentStep(2);
      
      toast({
        title: "Entry Submitted! 🎉",
        description: challenge 
          ? `Your build for "${challenge.title}" is now in the competition. AI will rank all entries when voting begins.`
          : "Your solution has been submitted successfully.",
      });
    } catch (error) {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      setCurrentStep(0);
      setSubmissionProgress(0);
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (challenge) {
      navigate("/challenges");
    } else {
      navigate(-1);
    }
  };

  const handleViewChallenge = () => {
    navigate("/challenges");
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
            {challenge ? `Submit to "${challenge.title}"` : "Submit Your Build"}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {challenge 
              ? `Submit your build and compete for $${challenge.winnerPrize.toFixed(0)}. AI will validate and rank all entries.`
              : "Submit your solution and let AI validate your problem-solution fit."
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
                        ) : index === 1 && isSubmitting ? (
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
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Build Details
                  </CardTitle>
                  <CardDescription>
                    Provide your build details. More integrations = higher scores from AI judges.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      {/* Required Fields */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="productName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Build Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Couple Conflict AI" {...field} />
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
                              <FormLabel>Live URL *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="https://my-build.lovable.app" 
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
                              <FormLabel>Demo Video (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://loom.com/share/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Integration Fields - Scoring Boost */}
                      <div className="pt-4 border-t border-border">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                          <div className="flex items-start gap-3">
                            <Award className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Boost Your Score</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Connect integrations for higher AI ranking. Revenue signals & active repos = higher scores.
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
                                  <Badge variant="secondary" className="text-[10px] ml-auto">+15 pts</Badge>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://github.com/username/repo" 
                                    {...field} 
                                  />
                                </FormControl>
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
                                  <Badge variant="secondary" className="text-[10px] ml-auto">+20 pts</Badge>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="pk_live_..." {...field} />
                                </FormControl>
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
                                  <Badge variant="secondary" className="text-[10px] ml-auto">+10 pts</Badge>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://xyzcompany.supabase.co" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="paymentInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Wallet className="h-4 w-4" />
                                  Payment Info (IBAN or Stripe Payment Link)
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="IBAN: DE89... or https://pay.stripe.com/..." 
                                    {...field} 
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-1">
                                  How you want to receive prize money if you win
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* AI Judging Info */}
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                        <div className="flex items-start gap-3">
                          <BarChart3 className="h-5 w-5 text-warning mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">How AI Judges Your Build</p>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-primary" />
                                Code Quality & Aesthetics
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3 text-primary" />
                                Problem-Solution Fit
                              </div>
                              <div className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-primary" />
                                Creativity & Innovation
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-primary" />
                                Revenue & Traction Signals
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-warning/20 text-xs">
                              <Mail className="h-3 w-3 text-primary" />
                              <span>Winners will receive results via email when judging ends</span>
                            </div>
                          </div>
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
                          <Rocket className="h-4 w-4 mr-2" />
                          Submit Entry
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 1 && isSubmitting && (
            <motion.div
              key="submitting"
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
                      <h3 className="text-xl font-bold">Submitting Your Entry</h3>
                      <p className="text-muted-foreground">
                        AI is validating your build and preparing for ranking...
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-3">
                      <Progress value={submissionProgress} size="lg" indicatorColor="gradient" />
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant={submissionProgress >= 20 ? "success" : "secondary"} className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Validating URL
                        </Badge>
                        <Badge variant={submissionProgress >= 40 ? "success" : "secondary"} className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Code Analysis
                        </Badge>
                        <Badge variant={submissionProgress >= 60 ? "success" : "secondary"} className="text-xs">
                          <Database className="h-3 w-3 mr-1" />
                          Integrations
                        </Badge>
                        <Badge variant={submissionProgress >= 80 ? "success" : "secondary"} className="text-xs">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Scoring
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && isSubmitted && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Success Card */}
              <Card variant="glow" className="border-success/30">
                <CardContent className="py-8">
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="h-20 w-20 rounded-full bg-success/20 mx-auto flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-10 w-10 text-success" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Entry Submitted! 🎉</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {challenge 
                          ? `Your build is now competing in "${challenge.title}". AI will rank all entries when the challenge ends.`
                          : "Your solution has been submitted successfully."
                        }
                      </p>
                    </div>

                    {challenge && (
                      <div className="flex items-center justify-center gap-6 pt-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-success font-bold text-xl">
                            <DollarSign className="h-5 w-5" />
                            {challenge.winnerPrize.toFixed(0)}
                          </div>
                          <p className="text-xs text-muted-foreground">potential prize</p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-warning font-bold text-xl">
                            <Clock className="h-5 w-5" />
                            {getTimeRemaining()?.replace(" remaining", "")}
                          </div>
                          <p className="text-xs text-muted-foreground">until voting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* What Happens Next */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    What Happens Next
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50 text-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-medium text-sm">Challenge Ends</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submissions close when timer hits zero
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 text-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-medium text-sm">AI Ranks Entries</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All builds scored on code, creativity & fit
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 text-center">
                      <div className="h-10 w-10 rounded-full bg-success/10 mx-auto mb-2 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-success" />
                      </div>
                      <p className="font-medium text-sm">Winner Announced</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Top builder takes 90% of the pool
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={handleViewChallenge}>
                  <Trophy className="h-4 w-4 mr-2" />
                  View Challenge
                </Button>
                <Button variant="glow" onClick={() => navigate("/")}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Explore More
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default SubmitSolution;
