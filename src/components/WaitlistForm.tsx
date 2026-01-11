import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinWaitlist, useWaitlistStatus } from "@/hooks/useWaitlist";
import { toast } from "sonner";

interface WaitlistFormProps {
  feature: "builds" | "leaderboard" | "general";
  variant?: "default" | "glow";
  buttonText?: string;
  className?: string;
}

export function WaitlistForm({ 
  feature, 
  variant = "glow",
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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/30 ${className}`}
      >
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">You're on the waitlist!</span>
      </motion.div>
    );
  }

  if (isCheckingStatus) {
    return (
      <Button variant={variant} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
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
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <Button type="submit" variant={variant} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Join"
            )}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
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
            className={`gap-2 ${className}`}
            onClick={handleButtonClick}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {buttonText}
              </>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
