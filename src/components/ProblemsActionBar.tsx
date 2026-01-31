import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutGrid } from "lucide-react";
import { ProblemsFilterPopover } from "@/components/ProblemsFilterPopover";
import { ColumnCount } from "@/components/MasonryGrid";
import mascotUfo from "@/assets/mascot-ufo.png";

interface FilterState {
  sources: string[];
  formats: string[];
}

interface ProblemsActionBarProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onAutoBuild: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  columnCount: ColumnCount;
  onCycleColumns: () => void;
}

export function ProblemsActionBar({
  isRefreshing,
  onRefresh,
  onAutoBuild,
  filters,
  onFiltersChange,
  columnCount,
  onCycleColumns,
}: ProblemsActionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      className="fixed bottom-6 right-6 z-50"
    >
      {/* Glassy container */}
      <motion.div
        className="relative flex items-center gap-1 px-2 py-1.5 rounded-full"
        style={{
          background: "linear-gradient(135deg, hsl(var(--card) / 0.6), hsl(var(--card) / 0.3))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: `
            inset 0 1px 1px hsl(0 0% 100% / 0.1),
            inset 0 -1px 1px hsl(0 0% 0% / 0.05),
            0 4px 16px hsl(var(--foreground) / 0.05),
            0 1px 3px hsl(var(--foreground) / 0.03)
          `,
          border: "1px solid hsl(var(--border) / 0.3)",
        }}
        whileHover={{
          boxShadow: `
            inset 0 1px 1px hsl(0 0% 100% / 0.15),
            inset 0 -1px 1px hsl(0 0% 0% / 0.05),
            0 8px 24px hsl(var(--foreground) / 0.08),
            0 2px 6px hsl(var(--foreground) / 0.04)
          `,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.03), transparent 70%)",
          }}
        />

        {/* Auto-Build Mascot */}
        <motion.button
          onClick={onAutoBuild}
          className="relative flex items-center justify-center cursor-pointer -ml-1 mt-0.5"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <img
            src={mascotUfo}
            alt="Auto-build"
            className="h-14 w-14 object-contain drop-shadow-md opacity-80 hover:opacity-100 transition-opacity duration-200"
            style={{ 
              imageRendering: "auto",
              filter: "drop-shadow(0 2px 4px hsl(var(--foreground) / 0.1))"
            }}
          />
          <motion.div
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 0.9, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.button>

        {/* Divider */}
        <div className="w-px h-5 bg-border/30" />

        {/* Refresh Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-muted-foreground hover:text-foreground h-8 w-8 hover:bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </motion.div>

        {/* Filter Popover */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          <ProblemsFilterPopover filters={filters} onFiltersChange={onFiltersChange} />
        </motion.div>

        {/* Column Switcher */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onCycleColumns}
            className="text-muted-foreground hover:text-foreground h-8 px-2 gap-1 hover:bg-transparent"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs font-medium tabular-nums">{columnCount}</span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
