import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSource {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const dataSources: DataSource[] = [
  { id: "reddit", name: "Reddit", icon: "🔴", color: "bg-orange-500/20" },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "bg-red-500/20" },
  { id: "twitter", name: "X", icon: "𝕏", color: "bg-foreground/10" },
  { id: "linkedin", name: "LinkedIn", icon: "in", color: "bg-blue-600/20" },
  { id: "instagram", name: "Instagram", icon: "📷", color: "bg-pink-500/20" },
  { id: "spotify", name: "Spotify", icon: "🎵", color: "bg-green-500/20" },
  { id: "facebook", name: "Facebook", icon: "f", color: "bg-blue-500/20" },
  { id: "tiktok", name: "TikTok", icon: "♪", color: "bg-foreground/10" },
  { id: "amazon", name: "Amazon", icon: "📦", color: "bg-yellow-500/20" },
  { id: "appstore", name: "App Store", icon: "📱", color: "bg-blue-400/20" },
  { id: "playstore", name: "Play Store", icon: "▷", color: "bg-green-400/20" },
  { id: "github", name: "GitHub", icon: "⌨️", color: "bg-foreground/10" },
  { id: "producthunt", name: "Product Hunt", icon: "🚀", color: "bg-orange-400/20" },
  { id: "trustpilot", name: "Trustpilot", icon: "⭐", color: "bg-green-500/20" },
  { id: "yelp", name: "Yelp", icon: "📍", color: "bg-red-600/20" },
  { id: "airbnb", name: "Airbnb", icon: "🏠", color: "bg-pink-400/20" },
];

interface DataSourceSelectorProps {
  onSelectionChange?: (selected: string[]) => void;
}

export function DataSourceSelector({ onSelectionChange }: DataSourceSelectorProps) {
  const [selected, setSelected] = useState<string[]>(["reddit"]);

  const toggleSource = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {dataSources.map((source, index) => {
          const isSelected = selected.includes(source.id);
          return (
            <motion.button
              key={source.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => toggleSource(source.id)}
              className={cn(
                "relative h-14 w-14 rounded-xl flex items-center justify-center text-lg transition-all duration-200",
                "border hover:scale-105 active:scale-95",
                isSelected
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border/50 bg-secondary/50 hover:border-border hover:bg-secondary"
              )}
            >
              <span className="text-xl">{source.icon}</span>
              
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
          );
        })}
        
        {/* Add More Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="h-14 w-14 rounded-xl border border-dashed border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>
      
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} source{selected.length !== 1 ? "s" : ""} selected for AI analysis
        </p>
      )}
    </div>
  );
}
