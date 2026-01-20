import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "xs" | "sm" | "md";
  showTooltip?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

export function VerifiedBadge({ 
  size = "sm", 
  showTooltip = true,
  className 
}: VerifiedBadgeProps) {
  const icon = (
    <ShieldCheck 
      className={cn(
        sizeMap[size],
        "text-success shrink-0",
        className
      )} 
    />
  );

  if (!showTooltip) {
    return icon;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">
            {icon}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Verified Builder</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
