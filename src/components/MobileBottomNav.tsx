import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Trophy,
  Layers,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Target, label: "Problems", path: "/problems" },
  { icon: null, label: "Fight", path: "/challenges", isCenter: true },
  { icon: Layers, label: "Accelerator", path: "/builds" },
  { icon: Trophy, label: "League", path: "/leaderboard" },
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

            // Center Challenge Button
            if (item.isCenter) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex items-center justify-center relative -mt-6"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                      isActive
                        ? "bg-gradient-to-br from-warning via-destructive to-warning"
                        : "bg-gradient-to-br from-warning/80 via-destructive/80 to-warning/80"
                    )}
                  >
                    <Swords className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                  {/* Glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-warning/30"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </NavLink>
              );
            }

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
