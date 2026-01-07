import { motion } from "framer-motion";
import { Users, Crown, Zap, MessageCircle, Trophy, Lock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: "lead" | "member";
  isOnline?: boolean;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
    >
      <Card 
        variant={isUserTeam ? "glow" : "elevated"} 
        className={`relative overflow-hidden ${isUserTeam ? "border-primary/50" : ""}`}
      >
        {/* Rank Badge */}
        {team.rank && team.rank <= 3 && (
          <div className="absolute top-2 right-2 z-10">
            <Badge 
              className={`gap-1 ${
                team.rank === 1 
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0" 
                  : team.rank === 2 
                  ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0"
                  : "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-0"
              }`}
            >
              <Trophy className="h-3 w-3" />
              #{team.rank}
            </Badge>
          </div>
        )}

        {/* Active Chat Indicator */}
        {team.chatActive && (
          <div className="absolute top-2 left-2 z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/30 text-[10px]">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Live
              </Badge>
            </motion.div>
          </div>
        )}

        <CardContent className="p-4 space-y-4">
          {/* Team Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{team.name}</h3>
              {team.streak && team.streak >= 3 && (
                <Badge variant="outline" className="text-[10px] gap-0.5 px-1.5">
                  🔥 {team.streak}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{team.tagline}</p>
          </div>

          {/* Members */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {team.members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + index * 0.1 }}
                  className="relative"
                >
                  <Avatar className={`h-8 w-8 border-2 ${isUserTeam ? "border-primary/50" : "border-background"}`}>
                    <AvatarFallback className={`text-xs ${member.role === "lead" ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {member.role === "lead" && (
                    <Crown className="absolute -top-1 -right-1 h-3 w-3 text-warning" />
                  )}
                  {member.isOnline && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-background" />
                  )}
                </motion.div>
              ))}
              
              {/* Empty Slots */}
              {Array.from({ length: slotsRemaining }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-8 w-8 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center bg-secondary/30"
                >
                  <span className="text-[10px] text-muted-foreground">+</span>
                </div>
              ))}
            </div>

            <div className="text-right">
              <p className="text-xs font-medium">{team.members.length}/{team.maxMembers}</p>
              <p className="text-[10px] text-muted-foreground">members</p>
            </div>
          </div>

          {/* Momentum Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Zap className="h-3 w-3 text-warning" />
                Momentum
              </span>
              <span className="font-medium text-warning">+{team.momentum}%</span>
            </div>
            <Progress value={Math.min(team.momentum, 100)} size="sm" indicatorColor="default" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isUserTeam ? (
              <Button variant="glow" size="sm" className="flex-1 gap-1.5" onClick={onViewChat}>
                <MessageCircle className="h-3.5 w-3.5" />
                Open Chat
              </Button>
            ) : isFull ? (
              <Button variant="secondary" size="sm" className="flex-1 gap-1.5" disabled>
                <Lock className="h-3.5 w-3.5" />
                Team Full
              </Button>
            ) : team.isHiring ? (
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onJoin}>
                <Sparkles className="h-3.5 w-3.5" />
                Request to Join
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="flex-1 gap-1.5" disabled>
                <Lock className="h-3.5 w-3.5" />
                Invite Only
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
