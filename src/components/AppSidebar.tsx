import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Radio,
  Swords,
  Flame,
  PanelLeftClose,
  X,
  ChevronUp,
  Settings,
  LogOut,
  ExternalLink,
  LogIn,
  Trophy,
  Rocket,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { AuthModal } from "@/components/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoIcon from "@/assets/logo-icon.png";
import builderTweet from "@/assets/builder-tweet.png";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";


interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = onClose !== undefined;
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const { isAdmin } = useSubscription();

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // Auto-close mobile menu on navigation
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [location.pathname]);

  const sidebarWidth = isMobile ? 280 : collapsed ? 56 : 256;

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
      className={cn("h-screen bg-sidebar flex flex-col", isMobile ? "w-70" : "sticky top-0")}
    >
      {/* Header */}
      <div 
        className="h-14 flex items-center justify-between px-4"
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) ? (
            <motion.span
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-base tracking-tight"
            >
              Mothership<span className="font-accent italic">X</span>
            </motion.span>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full"
            >
              <AnimatePresence mode="wait">
                {headerHovered ? (
                  <motion.button
                    key="expand-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setCollapsed(false)}
                    className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
                  >
                    <PanelLeftClose className="h-4 w-4 text-muted-foreground rotate-180" />
                  </motion.button>
                ) : (
                  <motion.img
                    key="logo-icon"
                    src={logoIcon}
                    alt="Mothership"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="h-6 w-6 object-contain"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {isMobile ? (
          <button onClick={onClose} className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : !collapsed ? (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {/* Signals */}
        <NavLink
          to="/problems"
          className={cn(
            "group flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
            location.pathname === "/problems" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Radio className="h-4 w-4 shrink-0 transition-colors group-hover:text-primary" />
          </motion.div>
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Signals
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Arena - Special styling */}
        <NavLink
          to="/challenges"
          className={cn(
            "group relative flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors overflow-hidden",
            location.pathname === "/challenges"
              ? "bg-gradient-to-r from-warning/15 to-destructive/15 text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-warning/10 hover:to-destructive/10",
          )}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.15, rotate: -8 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Swords className="h-4 w-4 shrink-0 text-warning" />
            <motion.div
              className="absolute -top-0.5 -right-0.5"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="h-2 w-2 text-destructive" />
            </motion.div>
          </motion.div>
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

        {/* Builder - Coming Soon with hover preview */}
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-md text-sm cursor-pointer",
                "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors",
              )}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              <AnimatePresence mode="wait">
                {(!collapsed || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                  >
                    <span>Launchpad</span>
                    <span className="text-[8px] bg-muted text-muted-foreground px-1 py-0.5 rounded font-medium">SOON</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </HoverCardTrigger>
          <HoverCardContent 
            side="right" 
            align="start" 
            sideOffset={12}
            className="w-auto p-0 border-0 bg-transparent shadow-2xl z-[100]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl"
            >
              <img 
                src={builderTweet} 
                alt="Builder preview" 
                className="max-w-[400px] rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </HoverCardContent>
        </HoverCard>

        {/* League - Coming Soon */}
        <div
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-md text-sm cursor-not-allowed opacity-50",
            "text-muted-foreground",
          )}
          title="Coming soon"
        >
          <Trophy className="h-4 w-4 shrink-0" />
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
              >
                <span>League</span>
                <span className="text-[8px] bg-muted text-muted-foreground px-1 py-0.5 rounded font-medium">SOON</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Profile Section */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        {isAuthenticated ? (
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
            <DropdownMenuContent align="start" className="w-48 bg-popover">
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile & Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                localStorage.removeItem("mothershipx-visited");
                navigate("/");
              }}>
                <ExternalLink className="h-4 w-4 mr-2" />
                About
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left"
          >
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
              <LogIn className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <AnimatePresence mode="wait">
              {(!collapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm text-muted-foreground overflow-hidden whitespace-nowrap"
                >
                  Sign in
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>

      {/* Legal Links - only visible when expanded */}
      <AnimatePresence mode="wait">
        {(!collapsed || isMobile) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/60"
          >
            <NavLink to="/privacy" className="hover:text-muted-foreground transition-colors">
              Privacy
            </NavLink>
            <span>·</span>
            <NavLink to="/terms" className="hover:text-muted-foreground transition-colors">
              Terms
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </motion.aside>
  );
}
