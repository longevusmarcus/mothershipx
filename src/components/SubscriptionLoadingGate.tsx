import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

interface SubscriptionLoadingGateProps {
  message?: string;
}

export function SubscriptionLoadingGate({ 
  message = "Checking access..." 
}: SubscriptionLoadingGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
    >
      <div className="relative">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <img src={logoIcon} alt="" className="h-8 w-8 object-contain" />
        </div>
        <div className="absolute -bottom-1 -right-1">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </motion.div>
  );
}
