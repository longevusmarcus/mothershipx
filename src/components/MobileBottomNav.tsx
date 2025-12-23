import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Rocket,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Target, label: "Problems", path: "/problems" },
  { icon: Rocket, label: "Builds", path: "/builds" },
  { icon: Trophy, label: "Rank", path: "/leaderboard" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/95 backdrop-blur-lg border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
