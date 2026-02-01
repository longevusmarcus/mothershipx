import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";
import { ProblemsFilterPopover } from "@/components/ProblemsFilterPopover";
import { ColumnCount } from "@/components/MasonryGrid";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FilterState {
  sources: string[];
  formats: string[];
}

interface ProblemsActionBarProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  columnCount: ColumnCount;
  onCycleColumns: () => void;
  isAdmin?: boolean;
}

export function ProblemsActionBar({
  isRefreshing,
  onRefresh,
  filters,
  onFiltersChange,
  columnCount,
  onCycleColumns,
  isAdmin = false,
}: ProblemsActionBarProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      className="fixed bottom-6 right-6 z-50"
    >
      {/* Glassy container */}
      <motion.div
        className="relative flex items-center gap-1 px-2 py-1.5 rounded-full shadow-lg dark:shadow-md"
        style={{
          background: "linear-gradient(135deg, hsl(var(--card) / 0.85), hsl(var(--card) / 0.6))",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          boxShadow: `
            inset 0 1px 2px hsl(0 0% 100% / 0.3),
            inset 0 -1px 2px hsl(0 0% 0% / 0.05),
            0 4px 20px hsl(var(--foreground) / 0.15),
            0 2px 8px hsl(var(--foreground) / 0.1)
          `,
          border: "1px solid hsl(var(--border) / 0.5)",
        }}
        whileHover={{
          boxShadow: `
            inset 0 1px 3px hsl(0 0% 100% / 0.35),
            inset 0 -1px 2px hsl(0 0% 0% / 0.05),
            0 8px 32px hsl(var(--foreground) / 0.18),
            0 4px 12px hsl(var(--foreground) / 0.12)
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

        {/* Filter Popover */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          <ProblemsFilterPopover filters={filters} onFiltersChange={onFiltersChange} />
        </motion.div>

        {/* Admin Search Button */}
        {isAdmin && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/search")}
                  className="text-muted-foreground hover:text-foreground h-8 w-8 hover:bg-transparent"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Search</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}

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
      </motion.div>
    </motion.div>
  );
}
