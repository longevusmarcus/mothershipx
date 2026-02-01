import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutoBuildModal } from "@/components/AutoBuildModal";

export function SuperModeButton() {
  const [superModeOpen, setSuperModeOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSuperModeOpen(true)}
            className="relative group"
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: 8 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="relative"
            >
              <Zap className="h-5 w-5 transition-colors group-hover:text-primary" />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">Super Mode</p>
        </TooltipContent>
      </Tooltip>

      <AutoBuildModal open={superModeOpen} onOpenChange={setSuperModeOpen} />
    </>
  );
}
