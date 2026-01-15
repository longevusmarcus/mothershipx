import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Globe,
  Swords,
  Flame,
  PanelLeftClose,
  X,
  ChevronUp,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: Plus, label: "New Search", path: "/" },
  { icon: Globe, label: "Library", path: "/problems" },
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
  const navigate = useNavigate();
  const isMobile = onClose !== undefined;
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // Auto-close mobile menu on navigation
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [location.pathname]);

  const sidebarWidth = isMobile ? 280 : (collapsed ? 56 : 256);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "h-screen bg-sidebar flex flex-col",
        isMobile ? "w-70" : "sticky top-0"
      )}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4">
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-base tracking-tight"
            >
              Mothership
            </motion.span>
          )}
        </AnimatePresence>
        
        {isMobile ? (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <PanelLeftClose className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              collapsed && "rotate-180"
            )} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
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

        {/* Arena - Special styling */}
        <NavLink
          to="/challenges"
          className={cn(
            "relative flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors overflow-hidden",
            location.pathname === "/challenges"
              ? "bg-gradient-to-r from-warning/15 to-destructive/15 text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-warning/10 hover:to-destructive/10"
          )}
        >
          <div className="relative">
            <Swords className="h-4 w-4 shrink-0 text-warning" />
            <motion.div
              className="absolute -top-0.5 -right-0.5"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="h-2 w-2 text-destructive" />
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
                <span>Arena</span>
                <span className="text-[9px] bg-destructive text-destructive-foreground px-1 py-0.5 rounded font-semibold">
                  LIVE
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>
      </nav>

      {/* Profile Section */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium shrink-0">
                {initials}
              </div>
              <AnimatePresence mode="wait">
                {(!collapsed || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 flex items-center justify-between overflow-hidden"
                  >
                    <span className="text-sm truncate">{displayName}</span>
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
}