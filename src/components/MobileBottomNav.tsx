import { NavLink, useLocation } from "react-router-dom";
import { Radio, Swords, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-14 bg-sidebar border-t border-sidebar-border">
        {/* Signals - Left */}
        <NavLink
          to="/problems"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-0.5",
            location.pathname === "/problems" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Radio className="h-5 w-5" strokeWidth={1.5} />
          <span className={cn("text-[10px]", location.pathname === "/problems" && "font-medium")}>Signals</span>
        </NavLink>

        {/* Arena - Center */}
        <NavLink
          to="/challenges"
          className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
        >
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center -mt-5",
              "bg-gradient-to-br from-warning to-destructive",
            )}
          >
            <Swords className="h-5 w-5 text-white" />
          </div>
          <span className={cn("text-[10px]", location.pathname === "/challenges" ? "text-foreground font-medium" : "text-muted-foreground")}>
            Arena
          </span>
        </NavLink>

        {/* League - Right (SOON) */}
        <div
          className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-muted-foreground opacity-50 cursor-not-allowed"
        >
          <Trophy className="h-5 w-5" strokeWidth={1.5} />
          <div className="flex items-center gap-1">
            <span className="text-[10px]">League</span>
            <span className="text-[7px] bg-muted text-muted-foreground px-1 py-0.5 rounded font-medium">SOON</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
