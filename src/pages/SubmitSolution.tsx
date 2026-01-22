import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Clock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateSubmission } from "@/hooks/useSubmissions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthModal } from "@/components/AuthModal";

const submissionSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(50, "Product name must be less than 50 characters"),
  productUrl: z.string().trim().url("Please enter a valid URL").max(200, "URL must be less than 200 characters"),
  demoUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .max(200, "URL must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  githubRepo: z.string().trim().max(200, "URL must be less than 200 characters").optional().or(z.literal("")),
  stripePublicKey: z.string().trim().max(100, "Key must be less than 100 characters").optional().or(z.literal("")),
  supabaseProjectUrl: z.string().trim().max(200, "URL must be less than 200 characters").optional().or(z.literal("")),
  paymentInfo: z.string().trim().max(100, "Payment info must be less than 100 characters").optional().or(z.literal("")),
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

interface ProblemContext {
  id: string;
  title: string;
  subtitle?: string;
  niche: string;
  opportunityScore: number;
  sentiment: string;
}

interface LocationState {
  challenge?: ChallengeContext;
  problem?: ProblemContext;
  joinType?: "solo" | "team";
  entryFee?: number;
}

const SubmitSolution = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const createSubmission = useCreateSubmission();

  const state = location.state as LocationState | null;
  const challenge = state?.challenge;
  const problem = state?.problem;
  const joinType = state?.joinType || "solo";

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, authLoading]);

  const getTimeRemaining = () => {
    if (!challenge?.endsAt) return null;
    const now = new Date();
    const endsAt = new Date(challenge.endsAt);
    const diff = endsAt.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const steps = [
    { id: "details", label: "Build Details" },
    { id: "submitting", label: "Submitting" },
    { id: "confirmed", label: "Confirmed" },
  ];

  const handleSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);
    setCurrentStep(1);

    const progressInterval = setInterval(() => {
      setSubmissionProgress((prev) => {
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
        problemId: problem?.id,
        joinType: joinType as "solo" | "team",
      });

      clearInterval(progressInterval);
      setSubmissionProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsSubmitting(false);
      setIsSubmitted(true);
      setCurrentStep(2);

      toast({
        title: "Build Submitted!",
        description: challenge
          ? `Your build for "${challenge.title}" is now in the competition.`
          : problem
            ? `Your build for "${problem.title}" has been submitted.`
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
    } else if (problem) {
      navigate(`/problems/${problem.id}`);
    } else {
      navigate(-1);
    }
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">
            {challenge ? "Submit Entry" : "Submit Build"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {challenge
              ? `Compete for $${challenge.winnerPrize.toFixed(0)} in "${challenge.title}"`
              : problem
                ? `Submit your build for "${problem.title}"`
                : "Submit your solution for AI validation"}
          </p>
        </motion.div>

        {/* Challenge Context */}
        {challenge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-4 rounded-lg border border-border bg-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{challenge.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  <Badge variant="secondary" className="text-[10px] mr-2">
                    {joinType === "solo" ? "Solo" : "Team"}
                  </Badge>
                  {challenge.trend}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <span className="text-success font-medium">${challenge.winnerPrize.toFixed(0)}</span>
                  <p className="text-[10px] text-muted-foreground">winner prize</p>
                </div>
                <div className="text-right">
                  <span
                    className={`font-medium ${getTimeRemaining() === "Ended" ? "text-destructive" : "text-warning"}`}
                  >
                    {getTimeRemaining()}
                  </span>
                  <p className="text-[10px] text-muted-foreground">to submit</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Example build idea</p>
              <p className="text-sm italic mt-1">"{challenge.example}"</p>
            </div>
          </motion.div>
        )}

        {/* Problem Context */}
        {problem && !challenge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-4 rounded-lg border border-border bg-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{problem.title}</p>
                {problem.subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{problem.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm shrink-0">
                <div className="text-right">
                  <span className="font-medium">{problem.opportunityScore}</span>
                  <p className="text-[10px] text-muted-foreground">score</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${
                    problem.sentiment === "exploding"
                      ? "bg-success/10 text-success"
                      : problem.sentiment === "rising"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted"
                  }`}
                >
                  {problem.sentiment}
                </Badge>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Niche</p>
              <p className="text-sm mt-1">{problem.niche}</p>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      index < currentStep
                        ? "bg-foreground text-background"
                        : index === currentStep
                          ? "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : index === 1 && isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-sm hidden sm:block ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-px mx-2 ${index < currentStep ? "bg-foreground" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1" />
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card p-5"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  {/* Required Fields */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Build Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Awesome App" className="h-10" {...field} />
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
                          <FormLabel className="text-sm">Live URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://my-app.lovable.app" className="h-10" {...field} />
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
                          <FormLabel className="text-sm text-muted-foreground">Demo Video (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://loom.com/share/..." className="h-10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Integration Fields */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-1">Boost Your Score</p>
                    <p className="text-xs text-muted-foreground mb-4">Connect integrations for higher AI ranking</p>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="githubRepo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm flex items-center justify-between">
                              GitHub Repository
                              <span className="text-xs text-muted-foreground font-normal">+15 pts</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://github.com/username/repo" className="h-10" {...field} />
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
                            <FormLabel className="text-sm flex items-center justify-between">
                              Stripe Publishable Key
                              <span className="text-xs text-muted-foreground font-normal">+20 pts</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="pk_live_..." className="h-10" {...field} />
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
                            <FormLabel className="text-sm flex items-center justify-between">
                              Supabase Project URL
                              <span className="text-xs text-muted-foreground font-normal">+10 pts</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://xyzcompany.supabase.co" className="h-10" {...field} />
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
                            <FormLabel className="text-sm">Payment Info</FormLabel>
                            <FormControl>
                              <Input placeholder="IBAN or Stripe Payment Link" className="h-10" {...field} />
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
                  <div className="p-4 rounded-lg bg-secondary/30 text-sm">
                    <p className="font-medium mb-2">How AI judges your build (check your email)</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>• Code quality & aesthetics</span>
                      <span>• Problem-solution fit</span>
                      <span>• Creativity & innovation</span>
                      <span>• Revenue & traction signals</span>
                    </div>
                  </div>

                  {/* Leaderboard & Rewards Info */}
                  <div className="p-4 rounded-lg border border-border bg-card text-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-warning/20 to-success/20 flex items-center justify-center">
                        <span className="text-xs">🏆</span>
                      </div>
                      <p className="font-medium">Compete forever on the leaderboard (soon)</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      After AI validation, your build enters the permanent leaderboard where it's continuously judged by
                      the market—real users and revenue signals determine your rank over time.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                        Cash Prizes
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-medium">
                        Cashback
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                        Perks
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-medium">
                        Glory
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <Button type="submit" size="sm" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                      Submit Entry
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {currentStep === 1 && isSubmitting && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card p-8"
            >
              <div className="text-center space-y-6">
                <div className="h-12 w-12 rounded-full bg-secondary mx-auto flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>

                <div>
                  <h3 className="font-medium">Submitting your entry</h3>
                  <p className="text-sm text-muted-foreground mt-1">AI is validating your build...</p>
                </div>

                <div className="max-w-xs mx-auto">
                  <Progress value={submissionProgress} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Validating</span>
                    <span>{submissionProgress}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && isSubmitted && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>

                <h3 className="font-medium text-lg">Entry Submitted</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {challenge
                    ? `Your build is now competing. AI will rank all entries when the challenge ends.`
                    : "Your solution has been submitted successfully."}
                </p>

                {challenge && (
                  <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border">
                    <div>
                      <span className="text-success font-medium">${challenge.winnerPrize.toFixed(0)}</span>
                      <p className="text-xs text-muted-foreground">potential prize</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {getTimeRemaining()}
                      </span>
                      <p className="text-xs text-muted-foreground">until voting</p>
                    </div>
                  </div>
                )}
              </div>

              {/* What's Next */}
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm font-medium mb-3">What happens next</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Submissions close when timer hits zero</p>
                  <p>2. AI ranks all builds on code, creativity & fit</p>
                  <p>3. Winner takes 90% of the prize pool</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/challenges")}>
                  View Challenge
                </Button>
                <Button size="sm" onClick={() => navigate("/")}>
                  Explore More
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </AppLayout>
  );
};

export default SubmitSolution;
