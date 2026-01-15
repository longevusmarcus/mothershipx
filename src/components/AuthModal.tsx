import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, X } from "lucide-react";
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

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (mode === "signin") {
      signIn(email, password);
    } else {
      signUp(name, email, password);
    }

    setIsLoading(false);
    toast.success(mode === "signin" ? "Welcome back" : "Account created");
    onOpenChange(false);
    onSuccess?.();
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 border-border bg-card overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
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

          {/* Title */}
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <h2 className="text-xl font-semibold tracking-tight mb-1">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue"
                : "Get started with MothershipX"}
            </p>
          </motion.div>

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

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-muted-foreground">
                Password
              </Label>
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

            <Button
              type="submit"
              className="w-full h-10 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
