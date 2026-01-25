import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { CommunityChallenges } from "@/components/CommunityChallenges";
import { FloatingJoinButton } from "@/components/FloatingJoinButton";
import { useTodayChallenge } from "@/hooks/useChallenges";
import { useQueryClient } from "@tanstack/react-query";

const Challenges = () => {
  const [paymentStatus, setPaymentStatus] = useState<"verifying" | "success" | "cancelled" | null>(null);
  const queryClient = useQueryClient();
  const { data: todaysChallenge } = useTodayChallenge();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get("payment");

    if (payment === "success") {
      setPaymentStatus("verifying");
      // Clear URL params
      window.history.replaceState({}, "", window.location.pathname);

      // Simulate verification delay (webhook processes in background)
      const timer = setTimeout(() => {
        setPaymentStatus("success");
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["challenges"] });
        queryClient.invalidateQueries({ queryKey: ["challenge-joins"] });

        setTimeout(() => {
          setPaymentStatus(null);
          toast.success("You've joined the challenge! Submit your build before time runs out.");
        }, 1500);
      }, 2000);

      return () => clearTimeout(timer);
    } else if (payment === "cancelled") {
      window.history.replaceState({}, "", window.location.pathname);
      toast.info("Payment cancelled. You can try again anytime.");
    }
  }, [queryClient]);

  return (
    <AppLayout>
      <SEO
        title="Hackathon Arena"
        description="Join weekly build challenges, compete solo or in teams, and win 90% of the prize pool."
      />

      {/* Payment Verification Overlay */}
      <AnimatePresence>
        {paymentStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-8 shadow-lg text-center max-w-sm mx-4"
            >
              {paymentStatus === "verifying" ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Verifying Payment</h3>
                  <p className="text-sm text-muted-foreground">Confirming your payment with Stripe...</p>
                </>
              ) : paymentStatus === "success" ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">Payment Confirmed!</h3>
                  <p className="text-sm text-muted-foreground">You're in the arena. Good luck!</p>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommunityChallenges />
      
      {/* Floating Join Button */}
      <FloatingJoinButton challenge={todaysChallenge ?? null} />
    </AppLayout>
  );
};

export default Challenges;
