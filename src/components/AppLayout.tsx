import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { WelcomeChatbot } from "@/components/WelcomeChatbot";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile } = useAuth();

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

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
        <header className="h-14 md:h-16 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="h-full px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Logo */}
              <div className="flex md:hidden items-center gap-2">
                <img src={logo} alt="Mothership" className="h-7 w-7 object-contain" />
                <span className="font-bold text-sm tracking-tight">Mothership</span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <NotificationsDropdown />
              <ThemeToggle />
              <Link to="/profile" className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs md:text-sm font-bold hover:opacity-90 transition-opacity">
                {initials}
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </div>

      {/* Welcome Chatbot - shows on all pages for first-time visitors */}
      <WelcomeChatbot />
    </div>
  );
}
