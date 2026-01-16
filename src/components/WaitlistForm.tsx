import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mail, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinWaitlist, useWaitlistStatus } from "@/hooks/useWaitlist";
import { toast } from "sonner";

interface WaitlistFormProps {
  feature: "builds" | "leaderboard" | "general";
  variant?: "default" | "outline" | "ghost";
  buttonText?: string;
  className?: string;
}

export function WaitlistForm({ 
  feature, 
  variant = "outline",
  buttonText = "Join Waitlist",
  className = "" 
}: WaitlistFormProps) {
  const { user, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [showInput, setShowInput] = useState(false);
  
  const { data: existingEntry, isLoading: isCheckingStatus } = useWaitlistStatus(feature);
  const { mutate: joinWaitlist, isPending, isSuccess, error, reset } = useJoinWaitlist();

  // Pre-fill email from profile
  useEffect(() => {
    if (profile?.email) {
      setEmail(profile.email);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [profile?.email, user?.email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    joinWaitlist({ email: email.trim(), feature }, {
      onSuccess: () => {
        toast.success("You're on the list!", {
          description: "We'll notify you when this feature launches.",
        });
        setShowInput(false);
      },
      onError: (err) => {
        toast.error(err.message || "Something went wrong");
      },
    });
  };

  const handleButtonClick = () => {
    // If user has email, submit directly
    if (email && !showInput) {
      joinWaitlist({ email: email.trim(), feature }, {
        onSuccess: () => {
          toast.success("You're on the list!", {
            description: "We'll notify you when this feature launches.",
          });
        },
        onError: (err) => {
          if (err.message.includes("already")) {
            toast.info("You're already on the waitlist!");
          } else {
            // Show input for manual entry
            setShowInput(true);
          }
        },
      });
    } else {
      setShowInput(true);
    }
  };

  // Already on waitlist
  if (existingEntry || isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border ${className}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-foreground/70" />
        <span className="text-sm font-light tracking-wide text-foreground/80">On the waitlist</span>
      </motion.div>
    );
  }

  if (isCheckingStatus) {
    return (
      <Button variant={variant} disabled className={`font-light tracking-wide ${className}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </Button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showInput ? (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleSubmit}
          className={`flex gap-2 ${className}`}
        >
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 font-light text-sm"
              autoFocus
            />
          </div>
          <Button type="submit" variant="default" disabled={isPending} className="font-light tracking-wide">
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Join"
            )}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="font-light"
            onClick={() => {
              setShowInput(false);
              reset();
            }}
          >
            Cancel
          </Button>
        </motion.form>
      ) : (
        <motion.div
          key="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Button 
            variant={variant} 
            className={`group gap-2 font-light tracking-wide ${className}`}
            onClick={handleButtonClick}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                {buttonText}
                <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
