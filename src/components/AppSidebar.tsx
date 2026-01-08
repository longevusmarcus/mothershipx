import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Trophy,
  Rocket,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Swords,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Target, label: "Problems", path: "/problems" },
  { icon: Rocket, label: "My Builds", path: "/builds" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
];

const bottomItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });
  const location = useLocation();
  const isMobile = onClose !== undefined;

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // Auto-close mobile menu on navigation
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [location.pathname]);

  const sidebarWidth = isMobile ? 288 : (collapsed ? 72 : 240);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.2 }}
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col",
        isMobile ? "w-72" : "sticky top-0"
      )}
    >
      {/* Logo */}
      <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Mothership" 
            className="h-8 w-8 md:h-9 md:w-9 object-contain"
          />
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-lg tracking-tight overflow-hidden whitespace-nowrap bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
              >
                Mothership
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "text-foreground"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-foreground" : "text-sidebar-foreground/50")} />
              <AnimatePresence mode="wait">
                {(!collapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        {/* Challenges Button - Standout Design */}
        <NavLink
          to="/challenges"
          className={cn(
            "relative flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] overflow-hidden",
            location.pathname === "/challenges"
              ? "bg-gradient-to-r from-warning/20 via-destructive/20 to-warning/20 text-foreground border border-warning/40"
              : "bg-gradient-to-r from-warning/10 via-destructive/10 to-warning/10 text-foreground hover:from-warning/20 hover:via-destructive/20 hover:to-warning/20 border border-warning/20 hover:border-warning/40"
          )}
        >
          {/* Animated glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-warning/0 via-warning/20 to-warning/0"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
          <div className="relative flex items-center gap-3 w-full">
            <div className="relative">
              <Swords className={cn(
                "h-5 w-5 shrink-0 text-warning",
                location.pathname === "/challenges" && "text-warning"
              )} />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="h-3 w-3 text-destructive" />
              </motion.div>
            </div>
            <AnimatePresence mode="wait">
              {(!collapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                >
                  <span className="font-semibold">Challenges</span>
                  <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                    LIVE
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </NavLink>

        {navItems.slice(2).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "text-foreground"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-foreground" : "text-sidebar-foreground/50")} />
              <AnimatePresence mode="wait">
                {(!collapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="py-4 px-3 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence mode="wait">
                {(!collapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        {/* Collapse Toggle - Desktop only */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center mt-2"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
