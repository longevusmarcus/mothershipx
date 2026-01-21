import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Import logos
import logoTiktok from "@/assets/logo-tiktok.png";
import logoReddit from "@/assets/logo-reddit.png";
import logoYoutube from "@/assets/logo-youtube.png";

interface DataSource {
  id: string;
  name: string;
  icon?: string;
  logo?: string;
  color: string;
  isLocked?: boolean;
}

// Available sources - TikTok and Reddit are selectable
const dataSources: DataSource[] = [
  { id: "tiktok", name: "TikTok", logo: logoTiktok, color: "bg-foreground/10", isLocked: false },
  { id: "reddit", name: "Reddit", logo: logoReddit, color: "bg-orange-500/20", isLocked: false },
];

// Coming soon sources - YouTube moved here, 3 locks total
const comingSoonSources: DataSource[] = [
  { id: "youtube", name: "YouTube", logo: logoYoutube, color: "bg-red-500/20", isLocked: true },
  { id: "google_trends", name: "Google Trends", icon: "📈", color: "bg-blue-500/20", isLocked: true },
  { id: "hackernews", name: "Hacker News", icon: "🔥", color: "bg-orange-400/20", isLocked: true },
];

interface DataSourceSelectorProps {
  onSelectionChange?: (selected: string) => void;
}

export function DataSourceSelector({ onSelectionChange }: DataSourceSelectorProps) {
  const [selected, setSelected] = useState<string>("tiktok");

  const selectSource = (source: DataSource) => {
    if (source.isLocked) return;
    setSelected(source.id);
    onSelectionChange?.(source.id);
  };

  return (
    <div className="space-y-4">
      {/* Main Sources */}
      <div className="flex flex-wrap gap-3">
        {dataSources.map((source, index) => {
          const isSelected = selected === source.id;
          const isDisabled = source.isLocked;
          return (
            <Tooltip key={source.id}>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => selectSource(source)}
                  disabled={isDisabled}
                  className={cn(
                    "relative h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-200",
                    "border",
                    isDisabled
                      ? "border-border/30 bg-secondary/30 cursor-not-allowed opacity-60"
                      : "hover:scale-105 active:scale-95",
                    !isDisabled && isSelected
                      ? "border-primary bg-card shadow-glow"
                      : !isDisabled && "border-border/50 bg-secondary/50 hover:border-border hover:bg-secondary",
                  )}
                >
                  {source.logo ? (
                    <img
                      src={source.logo}
                      alt={source.name}
                      className={cn("h-8 w-8 object-contain", isDisabled && "grayscale")}
                    />
                  ) : (
                    <span className="text-xl">{source.icon}</span>
                  )}

                  {isSelected && !isDisabled && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {source.name}
                  {isDisabled ? " - Coming Soon" : ""}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Coming Soon</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      {/* Locked Sources */}
      <div className="flex flex-wrap gap-3">
        {comingSoonSources.map((source, index) => (
          <Tooltip key={source.id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={cn(
                  "relative h-14 w-14 rounded-xl flex items-center justify-center",
                  "border border-border/20 bg-secondary/20 cursor-not-allowed opacity-60",
                )}
              >
                {source.logo ? (
                  <img
                    src={source.logo}
                    alt={source.name}
                    className="h-8 w-8 object-contain grayscale opacity-50"
                  />
                ) : (
                  <span className="text-xl opacity-50 grayscale">{source.icon}</span>
                )}
                <Lock className="h-3 w-3 text-muted-foreground/60 absolute bottom-1 right-1" />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{source.name} - Coming Soon</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Connect our data sources to uncover real problems and trends. Then build solutions together with our community
        of builders, compete for the best products, and win prizes.
      </p>
    </div>
  );
}
