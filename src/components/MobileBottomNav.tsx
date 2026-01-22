import { NavLink, useLocation } from "react-router-dom";
import { Plus, Globe, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Plus, label: "New Search", path: "/" },
  { icon: Swords, label: "Arena", path: "/challenges", isCenter: true },
  { icon: Globe, label: "Dashboard", path: "/problems" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-14 bg-sidebar border-t border-sidebar-border">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.isCenter) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center -mt-5",
                    "bg-gradient-to-br from-warning to-destructive"
                  )}
                >
                  <Swords className="h-5 w-5 text-white" />
                </div>
                <span className={cn(
                  "text-[10px]",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              <span className={cn(
                "text-[10px]",
                isActive && "font-medium"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}