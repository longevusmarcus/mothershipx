import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, Rocket } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

type ConfirmStatus = "verifying" | "success" | "error";

export default function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConfirmStatus>("verifying");

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | "recovery" | "magiclink" | "email_change" | "invite";

  useEffect(() => {
    if (!tokenHash || !type) {
      setStatus("error");
      return;
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
      if (error) {
        console.error("[AuthConfirm] Verification failed:", error.message);
        setStatus("error");
        return;
      }

      setStatus("success");

      if (type === "recovery") {
        toast.success("Email verified. Set your new password.");
        navigate("/auth?mode=reset", { replace: true });
      } else {
        toast.success("Your account is verified. Good luck, builder!");
        navigate("/", { replace: true });
      }
    });
  }, [tokenHash, type, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Rocket className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Mothership</span>
        </div>

        {status === "verifying" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">Verification failed</p>
            <p className="text-sm text-muted-foreground mb-4">
              This link may have expired or already been used.
            </p>
            <a
              href="/auth"
              className="text-sm text-primary hover:underline"
            >
              Go to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}
