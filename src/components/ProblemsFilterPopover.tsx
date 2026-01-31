import { useState } from "react";
import { Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FilterOption {
  id: string;
  label: string;
  soon?: boolean;
  isDefault?: boolean; // Default options don't filter, they show all
}

interface FilterState {
  sources: string[];
  formats: string[];
}

const sourceOptions: FilterOption[] = [
  { id: "tiktok_reddit", label: "TikTok / Reddit", isDefault: true },
  { id: "youtube", label: "YouTube", soon: true },
  { id: "moltbook", label: "Moltbook", soon: true },
  { id: "hackernews", label: "HackerNews", soon: true },
];

const formatOptions: FilterOption[] = [
  { id: "pain_trends", label: "Pain Points / Trends", isDefault: true },
  { id: "insights", label: "Insights", soon: true },
  { id: "competitors", label: "Competitors", soon: true },
];

interface ProblemsFilterPopoverProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function ProblemsFilterPopover({ filters, onFiltersChange }: ProblemsFilterPopoverProps) {
  const [open, setOpen] = useState(false);

  // Count only non-default active filters (which would be "soon" items, so effectively 0 for now)
  const activeCount = filters.sources.filter(s => !sourceOptions.find(o => o.id === s)?.isDefault).length 
    + filters.formats.filter(f => !formatOptions.find(o => o.id === f)?.isDefault).length;

  const toggleSource = (id: string) => {
    const option = sourceOptions.find(o => o.id === id);
    if (option?.soon) return;
    
    // Default options don't change filters - they just show all content
    if (option?.isDefault) {
      // Clear source filters to show all
      onFiltersChange({ ...filters, sources: [] });
      return;
    }
    
    const newSources = filters.sources.includes(id)
      ? filters.sources.filter(s => s !== id)
      : [...filters.sources, id];
    onFiltersChange({ ...filters, sources: newSources });
  };

  const toggleFormat = (id: string) => {
    const option = formatOptions.find(o => o.id === id);
    if (option?.soon) return;
    
    // Default options don't change filters - they just show all content
    if (option?.isDefault) {
      // Clear format filters to show all
      onFiltersChange({ ...filters, formats: [] });
      return;
    }
    
    const newFormats = filters.formats.includes(id)
      ? filters.formats.filter(f => f !== id)
      : [...filters.formats, id];
    onFiltersChange({ ...filters, formats: newFormats });
  };

  const clearAll = () => {
    onFiltersChange({ sources: [], formats: [] });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-muted-foreground hover:text-foreground h-8 w-8 relative",
            activeCount > 0 && "text-foreground"
          )}
        >
          <Filter className="h-4 w-4" />
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary text-[9px] font-medium text-primary-foreground flex items-center justify-center"
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-56 p-0 bg-popover border-border/50 shadow-lg"
        sideOffset={8}
      >
        <div className="p-3 space-y-3">
          {/* Sources Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Sources
              </span>
            </div>
            <div className="space-y-0.5">
              {sourceOptions.map((option) => (
                <FilterItem
                  key={option.id}
                  option={option}
                  selected={option.isDefault ? filters.sources.length === 0 : filters.sources.includes(option.id)}
                  onToggle={() => toggleSource(option.id)}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Formats Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Formats
              </span>
            </div>
            <div className="space-y-0.5">
              {formatOptions.map((option) => (
                <FilterItem
                  key={option.id}
                  option={option}
                  selected={option.isDefault ? filters.formats.length === 0 : filters.formats.includes(option.id)}
                  onToggle={() => toggleFormat(option.id)}
                />
              ))}
            </div>
          </div>

          {/* Clear All */}
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-1"
              >
                <button
                  onClick={clearAll}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 text-center"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterItem({ 
  option, 
  selected, 
  onToggle 
}: { 
  option: FilterOption; 
  selected: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={option.soon}
      className={cn(
        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
        option.soon
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-secondary/50 cursor-pointer",
        selected && !option.soon && "bg-secondary/70"
      )}
    >
      <span className="flex items-center gap-2">
        <span className={cn(selected && !option.soon && "text-foreground")}>
          {option.label}
        </span>
        {option.soon && (
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium">
            soon
          </span>
        )}
      </span>
      <AnimatePresence>
        {selected && !option.soon && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="h-3.5 w-3.5 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
