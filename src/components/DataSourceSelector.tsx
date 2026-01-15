import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Import logos
import logoTiktok from "@/assets/logo-tiktok.png";
import logoGoogleTrends from "@/assets/logo-google-trends.png";
import logoFreelancer from "@/assets/logo-freelancer.png";

interface DataSource {
  id: string;
  name: string;
  icon?: string;
  logo?: string;
  color: string;
  isLocked?: boolean;
}

// Only TikTok, Google Trends, and Freelancer are unlocked
const dataSources: DataSource[] = [
  { id: "tiktok", name: "TikTok", logo: logoTiktok, color: "bg-foreground/10", isLocked: false },
  { id: "google_trends", name: "Google Trends", logo: logoGoogleTrends, color: "bg-blue-500/20", isLocked: false },
  { id: "freelancer", name: "Freelancer", logo: logoFreelancer, color: "bg-blue-600/20", isLocked: false },
  // Locked sources - coming soon
  { id: "reddit", name: "Reddit", icon: "🔴", color: "bg-orange-500/20", isLocked: true },
  { id: "hackernews", name: "Hacker News", icon: "🔥", color: "bg-orange-400/20", isLocked: true },
  { id: "twitter", name: "X", icon: "𝕏", color: "bg-foreground/10", isLocked: true },
  { id: "linkedin", name: "LinkedIn", icon: "in", color: "bg-blue-600/20", isLocked: true },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "bg-red-500/20", isLocked: true },
  { id: "producthunt", name: "Product Hunt", icon: "🚀", color: "bg-orange-400/20", isLocked: true },
];

interface DataSourceSelectorProps {
  onSelectionChange?: (selected: string[]) => void;
}

export function DataSourceSelector({ onSelectionChange }: DataSourceSelectorProps) {
  const [selected, setSelected] = useState<string[]>(["tiktok", "google_trends", "freelancer"]);

  const toggleSource = (source: DataSource) => {
    if (source.isLocked) return;
    
    const newSelected = selected.includes(source.id)
      ? selected.filter((s) => s !== source.id)
      : [...selected, source.id];
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const unlockedSources = dataSources.filter(s => !s.isLocked);
  const lockedSources = dataSources.filter(s => s.isLocked);

  return (
    <div className="space-y-4">
      {/* Unlocked Sources */}
      <div className="flex flex-wrap gap-3">
        {unlockedSources.map((source, index) => {
          const isSelected = selected.includes(source.id);
          return (
            <Tooltip key={source.id}>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => toggleSource(source)}
                  className={cn(
                    "relative h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-200",
                    "border hover:scale-105 active:scale-95",
                    isSelected
                      ? "border-primary bg-card shadow-glow"
                      : "border-border/50 bg-secondary/50 hover:border-border hover:bg-secondary"
                  )}
                >
                  {source.logo ? (
                    <img 
                      src={source.logo} 
                      alt={source.name} 
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <span className="text-xl">{source.icon}</span>
                  )}
                  
                  {isSelected && (
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
                <p>{source.name}</p>
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
        {lockedSources.map((source, index) => (
          <Tooltip key={source.id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={cn(
                  "relative h-14 w-14 rounded-xl flex items-center justify-center",
                  "border border-border/20 bg-secondary/20 cursor-not-allowed"
                )}
              >
                <Lock className="h-4 w-4 text-muted-foreground/40" />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{source.name} - Coming Soon</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Connect 10+ data sources to discover real problems and trends. Then build solutions together with our community of builders.
      </p>
    </div>
  );
}
