import { useState } from "react";
import { Filter, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  { id: "competitors", label: "Incumbents", soon: true },
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
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className={cn(
          "text-muted-foreground hover:text-foreground h-8 w-8 relative hover:bg-transparent",
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-black border-primary/20 [&>button]:text-white [&>button]:hover:text-white/80">
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-10" />

          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-mono text-base text-white tracking-wide">Filters</h2>
                  <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                    customize your feed
                  </p>
                </div>
              </div>
            </div>

            {/* Filter sections */}
            <div className="space-y-5">
              {/* Sources Section */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-primary/80">
                    Sources
                  </span>
                </div>
                <div className="space-y-1">
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

              {/* Formats Section */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-primary/80">
                    Formats
                  </span>
                </div>
                <div className="space-y-1">
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
            </div>

            {/* Clear All */}
            <AnimatePresence>
              {activeCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5"
                >
                  <button
                    onClick={clearAll}
                    className="w-full text-xs font-mono text-white/50 hover:text-white transition-colors py-2 text-center border border-white/10 rounded-lg hover:border-white/20"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
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
        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-mono transition-all",
        option.soon
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/10 cursor-pointer",
        selected && !option.soon && "bg-primary/20 border border-primary/30"
      )}
    >
      <span className="flex items-center gap-2">
        <span className={cn(
          "text-white/70",
          selected && !option.soon && "text-white"
        )}>
          {option.label}
        </span>
        {option.soon && (
          <span className="text-[9px] uppercase tracking-wider text-white/30 font-medium px-1.5 py-0.5 rounded bg-white/5">
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
            <Check className="h-4 w-4 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
