import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, X, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import logoIcon from "@/assets/logo-icon.png";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type AuthMode = "signin" | "signup" | "forgot" | "forgot-sent";

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || "Failed to sign in");
          setIsLoading(false);
          return;
        }
        toast.success("Welcome back");
        onOpenChange(false);
        onSuccess?.();
      } else if (mode === "signup") {
        const { error } = await signUp(name, email, password);
        if (error) {
          toast.error(error.message || "Failed to create account");
          setIsLoading(false);
          return;
        }
        toast.success("Account created! Check your email to confirm.");
        onOpenChange(false);
        onSuccess?.();
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message || "Failed to send reset email");
          setIsLoading(false);
          return;
        }
        setMode("forgot-sent");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }

    setIsLoading(false);
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

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    if (newMode !== "forgot" && newMode !== "forgot-sent") {
      setEmail("");
      setPassword("");
      setName("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after modal closes
    setTimeout(() => {
      setMode("signin");
      setEmail("");
      setPassword("");
      setName("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 border-border bg-card overflow-hidden">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <img src={logoIcon} alt="" className="h-6 w-6 object-contain" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === "forgot-sent" ? (
              <motion.div
                key="forgot-sent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold tracking-tight mb-2">
                  Check your email
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  We sent a password reset link to<br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => switchMode("signin")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Title */}
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold tracking-tight mb-1">
                    {mode === "signin" && "Welcome back"}
                    {mode === "signup" && "Create account"}
                    {mode === "forgot" && "Reset password"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {mode === "signin" && "Sign in to continue"}
                    {mode === "signup" && "Get started with MothershipX"}
                    {mode === "forgot" && "We'll send you a reset link"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {mode === "signup" && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="space-y-1.5 mb-4">
                          <Label htmlFor="name" className="text-xs text-muted-foreground">
                            Name
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-10 bg-secondary/50 border-0 focus-visible:ring-1"
                            required={mode === "signup"}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 bg-secondary/50 border-0 focus-visible:ring-1"
                      required
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {mode !== "forgot" && (
                      <motion.div
                        key="password-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs text-muted-foreground">
                              Password
                            </Label>
                            {mode === "signin" && (
                              <button
                                type="button"
                                onClick={() => switchMode("forgot")}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Forgot?
                              </button>
                            )}
                          </div>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10 bg-secondary/50 border-0 focus-visible:ring-1"
                            required
                            minLength={8}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="w-full h-10 mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {mode === "signin" && "Sign in"}
                        {mode === "signup" && "Create account"}
                        {mode === "forgot" && "Send reset link"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Google Sign In */}
                {(mode === "signin" || mode === "signup") && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10"
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

                {/* Footer links */}
                <div className="mt-6 text-center space-y-2">
                  {mode === "forgot" ? (
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3 w-3 inline mr-1" />
                      Back to sign in
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {mode === "signin" ? (
                        <>
                          Don't have an account?{" "}
                          <span className="font-medium text-foreground">Sign up</span>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <span className="font-medium text-foreground">Sign in</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
