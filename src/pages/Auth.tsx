import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, Rocket, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { SEO } from "@/components/SEO";
import { supabase } from "@/lib/supabaseClient";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

type AuthMode = "signin" | "signup" | "forgot" | "forgot-sent" | "reset" | "reset-success";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get("mode");
  
  const [mode, setMode] = useState<AuthMode>(() => {
    if (urlMode === "reset") return "reset";
    return "signin";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; confirmPassword?: string }>({});

  const { signIn, signUp, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && mode !== "reset" && mode !== "reset-success") {
      navigate("/");
    }
  }, [isAuthenticated, navigate, mode]);

  // Handle URL mode changes
  useEffect(() => {
    if (urlMode === "reset") {
      setMode("reset");
    }
  }, [urlMode]);

  const validate = () => {
    const newErrors: { email?: string; password?: string; name?: string; confirmPassword?: string } = {};

    if (mode === "signin" || mode === "signup" || mode === "forgot") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }

    if (mode === "signin" || mode === "signup") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === "signup") {
      const nameResult = nameSchema.safeParse(name);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }

    if (mode === "reset") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(name, email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try signing in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! Check your email to confirm your account.");
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message || "Failed to send reset email");
        } else {
          setMode("forgot-sent");
        }
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          toast.error(error.message || "Failed to update password");
        } else {
          setMode("reset-success");
          toast.success("Password updated successfully!");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setErrors({});
  };

  const getTitle = () => {
    switch (mode) {
      case "signin": return "Welcome back";
      case "signup": return "Join the builders";
      case "forgot": return "Reset password";
      case "forgot-sent": return "Check your email";
      case "reset": return "Set new password";
      case "reset-success": return "Password updated";
      default: return "Welcome";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "signin": return "Sign in to continue your journey";
      case "signup": return "Create an account to start building";
      case "forgot": return "Enter your email and we'll send you a reset link";
      case "forgot-sent": return `We sent a reset link to ${email}`;
      case "reset": return "Enter your new password below";
      case "reset-success": return "You can now sign in with your new password";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SEO 
        title={mode === "signin" ? "Sign In" : mode === "signup" ? "Sign Up" : "Reset Password"}
        description="Join the community of builders solving real problems"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Mothership</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{getTitle()}</h1>
          <p className="text-muted-foreground text-sm">{getSubtitle()}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <AnimatePresence mode="wait">
            {/* Forgot Sent Success State */}
            {mode === "forgot-sent" && (
              <motion.div
                key="forgot-sent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Click the link in your email to reset your password. If you don't see it, check your spam folder.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMode("signin")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </motion.div>
            )}

            {/* Reset Success State */}
            {mode === "reset-success" && (
              <motion.div
                key="reset-success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    setMode("signin");
                    navigate("/auth");
                  }}
                >
                  Sign in
                </Button>
              </motion.div>
            )}

            {/* Form States */}
            {(mode === "signin" || mode === "signup" || mode === "forgot" || mode === "reset") && (
              <motion.form
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Name field for signup */}
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                )}

                {/* Email field for signin, signup, forgot */}
                {(mode === "signin" || mode === "signup" || mode === "forgot") && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                )}

                {/* Password field for signin, signup, reset */}
                {(mode === "signin" || mode === "signup" || mode === "reset") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">
                        {mode === "reset" ? "New Password" : "Password"}
                      </Label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                )}

                {/* Confirm Password for reset */}
                {mode === "reset" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === "signin" ? (
                    "Sign In"
                  ) : mode === "signup" ? (
                    "Create Account"
                  ) : mode === "forgot" ? (
                    "Send Reset Link"
                  ) : (
                    "Update Password"
                  )}
                </Button>

                {/* Back to signin for forgot/reset modes */}
                {(mode === "forgot" || mode === "reset") && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setMode("signin")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to sign in
                  </Button>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* Toggle signin/signup */}
          {(mode === "signin" || mode === "signup") && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === "signin"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
