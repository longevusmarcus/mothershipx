import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Github,
  CreditCard,
  Database,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { z } from "zod";

interface BuilderVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

interface VerificationResult {
  github: {
    valid: boolean;
    username: string;
    hasStarredRepos: boolean;
    totalStars: number;
    topRepos: { name: string; stars: number }[];
    message: string;
  };
  stripe: {
    valid: boolean;
    keyFormat: boolean;
    message: string;
  };
  supabase: {
    valid: boolean;
    keyFormat: boolean;
    message: string;
  };
  overall: {
    verified: boolean;
    score: number;
    message: string;
  };
}

const verificationSchema = z.object({
  githubUsername: z
    .string()
    .trim()
    .min(1, "GitHub username is required")
    .max(200, "GitHub value is too long"),
  stripePublicKey: z
    .string()
    .trim()
    .min(1, "Stripe key is required")
    .regex(/^pk_(live|test)_/, "Must be a Stripe publishable key (pk_...)")
    .max(200, "Stripe key is too long"),
  supabaseProjectKey: z
    .string()
    .trim()
    .min(1, "Supabase key is required")
    .regex(/^(eyJ|sb_publishable_)/, "Must be a valid Supabase key (anon JWT or sb_publishable_...)")
    .max(500, "Supabase key is too long"),
});

export function BuilderVerificationModal({
  open,
  onOpenChange,
  onVerified,
}: BuilderVerificationModalProps) {
  const [step, setStep] = useState<"form" | "verifying" | "result">("form");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [existingVerification, setExistingVerification] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    githubUsername: "",
    stripePublicKey: "",
    supabaseProjectKey: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for existing verification
  useEffect(() => {
    if (open) {
      checkExistingVerification();
    }
  }, [open]);

  const checkExistingVerification = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("builder_verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setExistingVerification(data);
      if (data.verification_status === "verified" && data.verification_result) {
        setResult(data.verification_result as unknown as VerificationResult);
        setStep("result");
      } else {
        // Pre-fill form with existing data
        setFormData({
          githubUsername: data.github_username || "",
          stripePublicKey: data.stripe_public_key || "",
          supabaseProjectKey: data.supabase_project_key || "",
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    // Validate form
    const validation = verificationSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsVerifying(true);
    setStep("verifying");

    try {
      const response = await supabase.functions.invoke("verify-builder", {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data);
      setStep("result");

      if (response.data.overall.verified) {
        toast.success("Verification successful!");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please try again.");
      setStep("form");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    if (result?.overall.verified) {
      onVerified();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setStep("form");
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>Builder Verification</DialogTitle>
          </div>
          <DialogDescription>
            Prove you've built something real. We verify builders to keep the arena exclusive.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              {/* GitHub */}
              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Username
                </Label>
                <Input
                  id="github"
                  placeholder="your-username"
                  value={formData.githubUsername}
                  onChange={(e) => handleInputChange("githubUsername", e.target.value)}
                  className={errors.githubUsername ? "border-destructive" : ""}
                />
                {errors.githubUsername && (
                  <p className="text-xs text-destructive">{errors.githubUsername}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We'll check for repos with at least 1 star
                </p>
              </div>

              {/* Stripe */}
              <div className="space-y-2">
                <Label htmlFor="stripe" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Stripe Publishable Key
                </Label>
                <Input
                  id="stripe"
                  placeholder="pk_live_..."
                  value={formData.stripePublicKey}
                  onChange={(e) => handleInputChange("stripePublicKey", e.target.value)}
                  className={errors.stripePublicKey ? "border-destructive" : ""}
                />
                {errors.stripePublicKey && (
                  <p className="text-xs text-destructive">{errors.stripePublicKey}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Live key preferred (shows you have paying customers)
                </p>
              </div>

              {/* Supabase */}
              <div className="space-y-2">
                <Label htmlFor="supabase" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Supabase Project Key
                </Label>
                <Input
                  id="supabase"
                  placeholder="eyJ... or sb_publishable_..."
                  value={formData.supabaseProjectKey}
                  onChange={(e) => handleInputChange("supabaseProjectKey", e.target.value)}
                  className={errors.supabaseProjectKey ? "border-destructive" : ""}
                />
                {errors.supabaseProjectKey && (
                  <p className="text-xs text-destructive">{errors.supabaseProjectKey}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your anon/public key from project settings
                </p>
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={isVerifying}>
                Verify My Credentials
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
              <p className="font-medium">Verifying your credentials...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Checking GitHub repos, Stripe keys, and more
              </p>
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              {/* Overall Status */}
              <div className={`p-4 rounded-lg border ${result.overall.verified ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}`}>
                <div className="flex items-center gap-3">
                  {result.overall.verified ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">{result.overall.message}</p>
                    <p className="text-sm text-muted-foreground">
                      Verification score: {result.overall.score}/100
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Results */}
              <div className="space-y-3">
                {/* GitHub */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <Github className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">GitHub</p>
                      {result.github.valid && result.github.hasStarredRepos ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{result.github.message}</p>
                    {result.github.topRepos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {result.github.topRepos.map((repo) => (
                          <span key={repo.name} className="inline-flex items-center gap-1 text-xs bg-background px-2 py-0.5 rounded">
                            <Star className="h-3 w-3 text-warning" />
                            {repo.name} ({repo.stars})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stripe */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <CreditCard className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">Stripe</p>
                      {result.stripe.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{result.stripe.message}</p>
                  </div>
                </div>

                {/* Supabase */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <Database className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">Supabase</p>
                      {result.supabase.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{result.supabase.message}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {result.overall.verified ? (
                <Button onClick={handleContinue} className="w-full">
                  Continue to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={resetForm} variant="outline" className="w-full">
                  Try Again
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
