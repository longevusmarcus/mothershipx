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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && mode !== "reset" && mode !== "reset-success") {
      navigate("/problems");
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
          navigate("/problems");
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || "Failed to sign in with Google");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsGoogleLoading(false);
    }
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
                        data-testid="auth-email-input"
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
                        data-testid="auth-password-input"
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

                <Button type="submit" className="w-full" disabled={isLoading} data-testid="auth-submit-button">
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

          {/* Google Sign In */}
          {(mode === "signin" || mode === "signup") && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </>
          )}

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
