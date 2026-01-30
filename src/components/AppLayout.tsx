import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { WelcomeChatbot } from "@/components/WelcomeChatbot";
import { AuthModal } from "@/components/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { User, Settings, Info, LogOut, LogIn, Crown, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logo from "@/assets/logo.png";

interface AppLayoutProps {
  children: ReactNode;
  hideChrome?: boolean; // Hide header and bottom nav on mobile (for immersive dashboard view)
}

export function AppLayout({ children, hideChrome = false }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { profile, user, signOut, isAuthenticated } = useAuth();
  const { hasPremiumAccess, isAdmin } = useSubscription();
  const navigate = useNavigate();

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAbout = () => {
    localStorage.removeItem("mothershipx-visited");
    navigate("/?about=true");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 md:hidden"
            >
              <AppSidebar onClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className={`h-14 md:h-16 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-40 ${hideChrome ? 'hidden md:block' : ''}`}>
          <div className="h-full px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Logo - only icon */}
              <div className="flex md:hidden items-center">
                <img src={logo} alt="Mothership" className="h-7 w-7 object-contain" />
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* Admin-only New Search Button */}
              {isAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/search")}
                      className="hidden md:flex text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New Search</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <NotificationsDropdown />
              <ThemeToggle />
              
              {isAuthenticated ? (
                <>
                  {/* Desktop - avatar with premium badge */}
              {hasPremiumAccess ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/profile" className="hidden md:flex relative">
                          <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                            {initials}
                          </div>
                          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-background">
                            <Crown className="h-2.5 w-2.5 text-white" />
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Premium Member</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link to="/profile" className="hidden md:flex relative">
                      <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                        {initials}
                      </div>
                    </Link>
                  )}
                  
                  {/* Mobile - dropdown menu with premium badge */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="md:hidden relative">
                        <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity">
                          {initials}
                        </div>
                        {hasPremiumAccess && (
                          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-background">
                            <Crown className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {hasPremiumAccess && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-amber-500 flex items-center gap-1.5">
                            <Crown className="h-3 w-3" />
                            Premium Member
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                        <User className="h-4 w-4" />
                        Profile & Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAbout} className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        About
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <LogIn className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-6 ${hideChrome ? 'pb-4' : 'pb-20'} md:pb-6`}>
          {children}
        </main>

        {/* Mobile Bottom Nav - hidden when hideChrome is true */}
        {!hideChrome && <MobileBottomNav />}
      </div>

      {/* Welcome Chatbot - shows on all pages for first-time visitors */}
      <WelcomeChatbot />

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
