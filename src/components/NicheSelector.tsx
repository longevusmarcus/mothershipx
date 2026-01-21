import { motion } from "framer-motion";
import { 
  Brain, 
  Dumbbell, 
  Sparkles, 
  Stethoscope, 
  Target, 
  Briefcase, 
  Users 
} from "lucide-react";

export const NICHES = [
  { id: "mental-health", label: "Mental Health", icon: Brain, keywords: ["anxiety", "depression", "stress", "therapy", "mental", "wellness", "mindfulness", "burnout", "overthinking", "emotional"] },
  { id: "weight-fitness", label: "Weight & Fitness", icon: Dumbbell, keywords: ["weight", "fitness", "gym", "workout", "exercise", "diet", "muscle", "fat", "cardio", "nutrition"] },
  { id: "skin-beauty", label: "Skin & Beauty", icon: Sparkles, keywords: ["skin", "beauty", "acne", "skincare", "glow", "makeup", "routine", "aging", "wrinkles", "hydration"] },
  { id: "gut-health", label: "Gut Health", icon: Stethoscope, keywords: ["gut", "digestion", "bloating", "probiotics", "stomach", "ibs", "food", "intolerance", "microbiome", "inflammation"] },
  { id: "productivity", label: "Productivity", icon: Target, keywords: ["productivity", "focus", "time", "procrastination", "habits", "discipline", "schedule", "organize", "morning", "routine"] },
  { id: "career", label: "Career", icon: Briefcase, keywords: ["career", "job", "interview", "resume", "salary", "promotion", "work", "boss", "linkedin", "networking"] },
  { id: "social", label: "Social Connections", icon: Users, keywords: ["social", "friends", "lonely", "dating", "relationship", "connection", "introvert", "conversation", "community", "networking"] },
] as const;

export type NicheId = typeof NICHES[number]["id"];

interface NicheSelectorProps {
  selectedNiche: NicheId | null;
  onSelect: (niche: NicheId) => void;
  disabled?: boolean;
}

export function NicheSelector({ selectedNiche, onSelect, disabled }: NicheSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        Select a niche to discover pain points
      </p>
      <div className="flex flex-wrap gap-2">
        {NICHES.map((niche, index) => {
          const Icon = niche.icon;
          const isSelected = selectedNiche === niche.id;
          
          return (
            <motion.button
              key={niche.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !disabled && onSelect(niche.id)}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                ${isSelected 
                  ? "bg-foreground text-background" 
                  : "bg-card border border-border hover:border-foreground/30"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{niche.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
