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
  const { signIn, signUp, resetPassword } = useAuth();

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
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary transition-colors z-10"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

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
