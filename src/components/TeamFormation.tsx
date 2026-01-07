import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Users, 
  Zap, 
  Trophy, 
  Rocket, 
  Gift,
  Crown,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TeamCard, type Team } from "./TeamCard";
import { TeamChat } from "./TeamChat";

// Mock teams data
const mockTeams: Team[] = [
  {
    id: "1",
    name: "Velocity Squad",
    tagline: "Ship fast, learn faster",
    members: [
      { id: "1", name: "Alex Chen", avatar: "A", role: "lead", isOnline: true },
      { id: "2", name: "Sarah Kim", avatar: "S", role: "member", isOnline: true },
      { id: "3", name: "Mike J", avatar: "M", role: "member", isOnline: false },
    ],
    maxMembers: 4,
    momentum: 89,
    rank: 1,
    isHiring: true,
    chatActive: true,
    streak: 7,
  },
  {
    id: "2",
    name: "Build Crew",
    tagline: "From problem to product",
    members: [
      { id: "4", name: "Emma D", avatar: "E", role: "lead", isOnline: true },
      { id: "5", name: "James W", avatar: "J", role: "member", isOnline: false },
    ],
    maxMembers: 3,
    momentum: 67,
    rank: 2,
    isHiring: true,
    chatActive: false,
    streak: 4,
  },
  {
    id: "3",
    name: "Midnight Hackers",
    tagline: "Sleep is overrated",
    members: [
      { id: "6", name: "Lisa A", avatar: "L", role: "lead", isOnline: false },
      { id: "7", name: "David B", avatar: "D", role: "member", isOnline: false },
      { id: "8", name: "Maria G", avatar: "M", role: "member", isOnline: true },
      { id: "9", name: "Robert T", avatar: "R", role: "member", isOnline: false },
    ],
    maxMembers: 4,
    momentum: 45,
    rank: 3,
    isHiring: false,
    chatActive: true,
    streak: 2,
  },
];

interface TeamFormationProps {
  problemId: string;
}

export function TeamFormation({ problemId }: TeamFormationProps) {
  const { toast } = useToast();
  const [teams] = useState<Team[]>(mockTeams);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamTagline, setTeamTagline] = useState("");

  const handleJoinTeam = (team: Team) => {
    toast({
      title: "Request Sent! 🎉",
      description: `Your request to join ${team.name} has been sent to the team lead.`,
    });
  };

  const handleOpenChat = (team: Team) => {
    setSelectedTeam(team);
    setIsChatOpen(true);
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    
    toast({
      title: "Team Created! 🚀",
      description: `${teamName} is ready. Invite builders to join your squad!`,
    });
    setIsCreateOpen(false);
    setTeamName("");
    setTeamTagline("");
  };

  // User's team (mock - first team for demo)
  const userTeam = teams[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Squad Arena
          </h2>
          <p className="text-sm text-muted-foreground">
            Form teams, compete, and win acceleration rewards
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="glow" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Squad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Create Your Squad
              </DialogTitle>
              <DialogDescription>
                Assemble a team of 2-4 builders. Compete with other squads and win acceleration rewards.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Squad Name</Label>
                <Input
                  id="team-name"
                  placeholder="e.g., Velocity Squad"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-tagline">Tagline</Label>
                <Input
                  id="team-tagline"
                  placeholder="e.g., Ship fast, learn faster"
                  value={teamTagline}
                  onChange={(e) => setTeamTagline(e.target.value)}
                />
              </div>
              <Button 
                variant="glow" 
                className="w-full" 
                onClick={handleCreateTeam}
                disabled={!teamName.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Launch Squad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rewards Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-warning/20 bg-gradient-to-r from-warning/5 via-background to-warning/5 p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                Sprint Rewards
                <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
                  Active
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                Top 3 squads win acceleration & distribution for their solution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <Gift className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">🥇 $5K + Launch</p>
            </div>
            <div className="text-center">
              <Gift className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">🥈 $2K + Feature</p>
            </div>
            <div className="text-center">
              <Gift className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">🥉 $1K + Shoutout</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Your Squad */}
      {userTeam && (
        <Card variant="glow" className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crown className="h-4 w-4 text-warning" />
              Your Squad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamCard
              team={userTeam}
              isUserTeam
              onViewChat={() => handleOpenChat(userTeam)}
            />
          </CardContent>
        </Card>
      )}

      {/* All Squads */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            Active Squads
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {teams.length} teams competing
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {teams.slice(1).map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              delay={index * 0.1}
              onJoin={() => handleJoinTeam(team)}
              onViewChat={() => handleOpenChat(team)}
            />
          ))}
        </div>
      </div>

      {/* Team Chat Drawer */}
      {selectedTeam && (
        <TeamChat
          team={selectedTeam}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
