import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Trophy,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Target, label: "Problems", path: "/problems" },
  { icon: Layers, label: "Builds", path: "/builds" },
  { icon: Trophy, label: "Rank", path: "/leaderboard" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="relative mx-auto max-w-md">
        {/* Glass pill container */}
        <div className="flex items-center justify-around h-16 px-2 rounded-2xl bg-card/70 dark:bg-card/60 backdrop-blur-xl border border-border/50 shadow-lg">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 relative",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1"
                >
                  {item.icon && (
                    <item.icon 
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive && "text-foreground"
                      )} 
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  )}
                  <span className={cn(
                    "text-[10px] transition-colors",
                    isActive ? "font-semibold" : "font-medium"
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
