import { motion } from "framer-motion";
import { Crown, MessageCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: "lead" | "member";
  isOnline?: boolean;
  isVerified?: boolean;
}

export interface Team {
  id: string;
  name: string;
  tagline: string;
  members: TeamMember[];
  maxMembers: number;
  momentum: number;
  rank?: number;
  isHiring?: boolean;
  chatActive?: boolean;
  streak?: number;
}

interface TeamCardProps {
  team: Team;
  onJoin?: () => void;
  onViewChat?: () => void;
  isUserTeam?: boolean;
  delay?: number;
}

export function TeamCard({ team, onJoin, onViewChat, isUserTeam, delay = 0 }: TeamCardProps) {
  const slotsRemaining = team.maxMembers - team.members.length;
  const isFull = slotsRemaining === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className={`p-4 rounded-lg border ${isUserTeam ? "border-foreground/20" : "border-border/50"} bg-background space-y-4`}>
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">{team.name}</h3>
              {team.streak && team.streak >= 3 && (
                <span className="text-xs text-muted-foreground">🔥 {team.streak}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              {team.chatActive && (
                <span className="flex items-center gap-1 text-[10px] text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live
                </span>
              )}
              {team.rank && team.rank <= 3 && (
                <span className="text-xs font-medium">#{team.rank}</span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{team.tagline}</p>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members.map((member) => (
              <TooltipProvider key={member.id} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className={`h-7 w-7 border-2 ${isUserTeam ? "border-foreground/10" : "border-background"}`}>
                        <AvatarFallback className={`text-[10px] ${member.role === "lead" ? "bg-foreground text-background" : "bg-secondary"}`}>
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {member.role === "lead" && (
                        <Crown className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 text-foreground/60" />
                      )}
                      {member.isOnline && (
                        <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success border border-background" />
                      )}
                      {member.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-background flex items-center justify-center">
                          <VerifiedBadge size="xs" showTooltip={false} />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>{member.name}{member.isVerified ? " ✓ Verified" : ""}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            {/* Empty Slots */}
            {Array.from({ length: slotsRemaining }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-7 w-7 rounded-full border border-dashed border-border/50 flex items-center justify-center bg-secondary/20"
              >
                <span className="text-[10px] text-muted-foreground">+</span>
              </div>
            ))}
          </div>

          <div className="text-right">
            <p className="text-xs font-medium">{team.members.length}/{team.maxMembers}</p>
          </div>
        </div>

        {/* Momentum */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Momentum</span>
            <span className="font-medium">+{team.momentum}%</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(team.momentum, 100)}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-foreground/60 rounded-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          {isUserTeam ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={onViewChat}>
              <MessageCircle className="h-3 w-3" />
              Open Chat
            </Button>
          ) : isFull ? (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8" disabled>
              <Lock className="h-3 w-3" />
              Team Full
            </Button>
          ) : team.isHiring ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={onJoin}>
              Request to Join
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8" disabled>
              <Lock className="h-3 w-3" />
              Invite Only
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
