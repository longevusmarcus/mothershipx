import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinWaitlist, useWaitlistStatus } from "@/hooks/useWaitlist";
import { toast } from "sonner";

interface WaitlistFormProps {
  feature: "builds" | "leaderboard" | "general";
  variant?: "default" | "glow" | "minimal";
  buttonText?: string;
  className?: string;
}

export function WaitlistForm({ 
  feature, 
  variant = "minimal",
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
        className={`inline-flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        <span className="font-light tracking-wide">on the waitlist</span>
      </motion.div>
    );
  }

  if (isCheckingStatus) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
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
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 text-sm border-border/50 bg-background/50 placeholder:text-muted-foreground/50 placeholder:font-light"
            autoFocus
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={isPending}
            className="h-9 px-4 font-normal tracking-wide"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "join"
            )}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className="h-9 px-3 font-normal text-muted-foreground"
            onClick={() => {
              setShowInput(false);
              reset();
            }}
          >
            cancel
          </Button>
        </motion.form>
      ) : (
        <motion.div
          key="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <button 
            onClick={handleButtonClick}
            disabled={isPending}
            className={`
              group inline-flex items-center gap-2 
              px-5 py-2.5 rounded-full
              bg-foreground/90 text-background
              text-sm font-normal tracking-wide
              transition-all duration-300
              hover:bg-foreground hover:gap-3
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <span>{buttonText}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
