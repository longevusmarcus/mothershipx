import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, AlertCircle, Loader2 } from "lucide-react";
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
import { TeamCard } from "./TeamCard";
import { TeamChat } from "./TeamChat";
import { createSquadSchema } from "@/lib/validations";
import { useSquads, type Squad } from "@/hooks/useSquads";
import { useVerifiedBuilders } from "@/hooks/useVerifiedBuilders";
import { useAuth } from "@/contexts/AuthContext";

interface TeamFormationProps {
  problemId: string;
  problemTitle?: string;
}

export function TeamFormation({ problemId, problemTitle = "SaaS Onboarding" }: TeamFormationProps) {
  const { user } = useAuth();
  const { squads, userSquad, isLoading, createSquad, joinSquad, leaveSquad } = useSquads(problemId);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamTagline, setTeamTagline] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; tagline?: string }>({});

  // Collect all squad member user IDs for verification check
  const allMemberIds = squads
    .flatMap((s) => s.members?.map((m) => m.user_id) || [])
    .filter((id): id is string => !!id);
  const { data: verifiedBuilders } = useVerifiedBuilders(allMemberIds);

  const handleJoinTeam = (squad: Squad) => {
    joinSquad.mutate(squad.id);
  };

  const handleOpenChat = (squad: Squad) => {
    setSelectedSquad(squad);
    setIsChatOpen(true);
  };

  const handleCreateTeam = () => {
    const result = createSquadSchema.safeParse({ name: teamName, tagline: teamTagline });
    
    if (!result.success) {
      const errors: { name?: string; tagline?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") errors.name = err.message;
        if (err.path[0] === "tagline") errors.tagline = err.message;
      });
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    createSquad.mutate(
      { name: teamName, tagline: teamTagline || undefined },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setTeamName("");
          setTeamTagline("");
        },
      }
    );
  };

  // Transform Squad to TeamCard format
  const transformSquadForCard = (squad: Squad) => ({
    id: squad.id,
    name: squad.name,
    tagline: squad.tagline || "",
    members: squad.members?.map((m) => ({
      id: m.id,
      name: m.profile?.name || "Anonymous",
      avatar: m.profile?.name?.[0] || "?",
      role: m.role,
      isOnline: m.is_online,
      isVerified: verifiedBuilders?.has(m.user_id) || false,
    })) || [],
    maxMembers: squad.max_members,
    momentum: squad.momentum,
    rank: squad.rank || undefined,
    isHiring: squad.is_hiring,
    chatActive: true,
    streak: squad.streak,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-lg">Squad Arena</h2>
          <p className="text-sm text-muted-foreground">
            Form teams, compete, and win acceleration rewards
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" disabled={!user}>
              <Plus className="h-3.5 w-3.5" />
              Create Squad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Your Squad</DialogTitle>
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
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={formErrors.name ? "border-destructive" : ""}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-tagline">Tagline (optional)</Label>
                <Input
                  id="team-tagline"
                  placeholder="e.g., Ship fast, learn faster"
                  value={teamTagline}
                  onChange={(e) => {
                    setTeamTagline(e.target.value);
                    if (formErrors.tagline) setFormErrors(prev => ({ ...prev, tagline: undefined }));
                  }}
                  className={formErrors.tagline ? "border-destructive" : ""}
                />
                {formErrors.tagline && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.tagline}
                  </p>
                )}
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateTeam}
                disabled={createSquad.isPending}
              >
                {createSquad.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Launch Squad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rewards Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg border border-border/50 bg-secondary/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2">
              Sprint Rewards
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground/70">Active</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Top 3 squads win acceleration & distribution for their solution
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>🥇 $5K + Launch</span>
            <span>🥈 $2K + Feature</span>
            <span>🥉 $1K + Shoutout</span>
          </div>
        </div>
      </motion.div>

      {/* Your Squad */}
      {userSquad && (
        <div className="space-y-3">
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Your Squad</h3>
          <TeamCard
            team={transformSquadForCard(userSquad)}
            isUserTeam
            onViewChat={() => handleOpenChat(userSquad)}
          />
        </div>
      )}

      {/* All Squads */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Active Squads</h3>
          <span className="text-xs text-muted-foreground">{squads.length} teams</span>
        </div>

        {squads.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-border/50 text-center">
            <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No squads yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {squads
              .filter((squad) => squad.id !== userSquad?.id)
              .map((squad, index) => (
                <TeamCard
                  key={squad.id}
                  team={transformSquadForCard(squad)}
                  delay={index * 0.05}
                  onJoin={() => handleJoinTeam(squad)}
                  onViewChat={() => handleOpenChat(squad)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Team Chat Drawer */}
      {selectedSquad && (
        <TeamChat
          squadId={selectedSquad.id}
          squadName={selectedSquad.name}
          members={selectedSquad.members?.map((m) => ({
            id: m.id,
            name: m.profile?.name || "Anonymous",
            avatar: m.profile?.name?.[0] || "?",
            role: m.role,
            isOnline: m.is_online,
          })) || []}
          momentum={selectedSquad.momentum}
          rank={selectedSquad.rank}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          problemTitle={problemTitle}
        />
      )}
    </div>
  );
}
