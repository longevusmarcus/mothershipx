import { LucideIcon, User, Palette, Eye, Image, Settings, Link as LinkIcon, Plus, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileSettingsItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  actionLabel?: string;
}

export function ProfileSettingsItem({
  icon: Icon,
  title,
  description,
  onClick,
  actionLabel = "Update",
}: ProfileSettingsItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 2 }}
      className="flex items-center justify-between gap-4 py-3 group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-medium truncate">{title}</h4>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        className="h-8 px-4 text-xs font-medium shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
      >
        {actionLabel}
      </Button>
    </motion.div>
  );
}

interface ProfileSocialLinkItemProps {
  icon: LucideIcon;
  label: string;
  url?: string;
  onAdd?: () => void;
}

export function ProfileSocialLinkItem({
  icon: Icon,
  label,
  url,
  onAdd,
}: ProfileSocialLinkItemProps) {
  if (!url && onAdd) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Social Link
      </motion.button>
    );
  }

  return (
    <motion.a
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-sm"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="truncate">{label}</span>
    </motion.a>
  );
}

interface ProfileStatProps {
  value: string | number;
  label: string;
  className?: string;
}

export function ProfileStat({ value, label, className }: ProfileStatProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("text-left", className)}
    >
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}

interface ProfileSectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ProfileSectionHeader({ children, className }: ProfileSectionHeaderProps) {
  return (
    <h3 className={cn(
      "text-[11px] font-medium text-primary uppercase tracking-wider mb-3",
      className
    )}>
      {children}
    </h3>
  );
}
