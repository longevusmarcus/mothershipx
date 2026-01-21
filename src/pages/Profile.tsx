import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  Pencil,
  Check,
  Layers,
  User,
  Link as LinkIcon,
  CheckCircle2,
  Award,
  LogOut,
  Camera,
  Loader2,
  Target,
  Settings,
  Sparkles,
  Trophy,
  ExternalLink,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useUserStats, getXpProgress, getLevelTitle } from "@/hooks/useUserStats";
import { useIsBuilderVerified } from "@/hooks/useBuilderVerification";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MyProblems } from "@/components/MyProblems";
import { ArenaHistory } from "@/components/ArenaHistory";

// Achievement definitions
const achievementDefs = [
  { id: 1, name: "First Build", description: "Submitted your first solution", icon: Layers, check: (stats: any) => stats.solutionsShipped >= 1 },
  { id: 2, name: "Problem Solver", description: "Joined 5 problems", icon: Target, check: (stats: any) => stats.problemsJoined >= 5 },
  { id: 3, name: "Arena Warrior", description: "Entered 3 challenges", icon: Trophy, check: (stats: any) => stats.challengesEntered >= 3 },
  { id: 4, name: "Challenge Victor", description: "Won a challenge", icon: Award, check: (stats: any) => stats.challengesWon >= 1 },
  { id: 5, name: "Level 5", description: "Reached level 5", icon: Sparkles, check: (stats: any) => stats.currentLevel >= 5 },
  { id: 6, name: "Elite Builder", description: "Reach level 10", icon: Trophy, check: (stats: any) => stats.currentLevel >= 10 },
];

export default function Profile() {
  const { user, profile, isAuthenticated, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { data: userStats } = useUserStats();
  const { isVerified, verification } = useIsBuilderVerified();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    twitter: "",
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        github: profile.github || "",
        twitter: profile.twitter || "",
      });
    }
  }, [profile]);

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await updateProfile({
      name: formData.name,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      github: formData.github,
      twitter: formData.twitter,
    });
    setIsLoading(false);
    if (!error) {
      setIsEditing(false);
      toast.success("Profile updated!");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await updateProfile({ avatar_url: avatarUrl });
      if (updateError) throw updateError;
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile/${user?.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.name || "Builder"}'s Profile`, url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  // Not authenticated view
  if (!isAuthenticated || !user) {
    return (
      <AppLayout>
        <SEO title="Profile" description="View your builder profile." />
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-lg font-medium mb-2">Not signed in</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Sign in to view your profile and track progress.
          </p>
          <Button onClick={() => setShowAuthModal(true)} size="sm">Sign In</Button>
        </div>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </AppLayout>
    );
  }

  const xpProgress = userStats ? getXpProgress(userStats.totalXp) : { percentage: 0, nextLevelXp: 500 };
  const levelTitle = userStats ? getLevelTitle(userStats.currentLevel) : "Newcomer";

  return (
    <AppLayout>
      <SEO title="Profile" description="Your builder profile and achievements." />
      
      {/* Main container with strict overflow control */}
      <div className="w-full max-w-full overflow-hidden space-y-4">
        
        {/* Header row */}
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and track progress</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShareProfile}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Profile Card - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4 overflow-hidden"
        >
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              <Avatar className={`h-16 w-16 ${isEditing ? "cursor-pointer" : ""}`} onClick={handleAvatarClick}>
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "Avatar"} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                  {isUploadingAvatar ? <Loader2 className="h-4 w-4 text-background animate-spin" /> : <Camera className="h-4 w-4 text-background" />}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="text-base font-semibold h-8 mb-1"
                />
              ) : (
                <h2 className="text-lg font-semibold truncate">{profile?.name || "Builder"}</h2>
              )}
              
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{levelTitle}</Badge>
                {isVerified && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-0.5">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Verified
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[180px]">
                      <p className="text-xs">Verified GitHub, Stripe & Supabase</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                {formData.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{formData.location}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar className="h-3 w-3" />
                  {joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Level {userStats?.currentLevel || 1}</span>
              <span className="text-muted-foreground">{userStats?.totalXp || 0} / {xpProgress.nextLevelXp} XP</span>
            </div>
            <Progress value={xpProgress.percentage} className="h-1" />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 p-1 h-9 overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs px-3 h-7">Overview</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs px-3 h-7">Achievements</TabsTrigger>
            <TabsTrigger value="account" className="text-xs px-3 h-7">Account</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Bio */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                About
              </h3>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Short bio..."
                  className="resize-none text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground break-words">
                  {formData.bio || "No bio yet."}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Links
              </h3>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="yoursite.com"
                    className="h-8 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="GitHub"
                      className="h-8 text-sm"
                    />
                    <Input
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="Twitter"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {(formData.website || formData.github || formData.twitter) ? (
                    <>
                      {formData.website && (
                        <a href={`https://${formData.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground truncate">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{formData.website}</span>
                        </a>
                      )}
                      {formData.github && (
                        <a href={`https://github.com/${formData.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground truncate">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">github.com/{formData.github}</span>
                        </a>
                      )}
                      {formData.twitter && (
                        <a href={`https://twitter.com/${formData.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground truncate">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">@{formData.twitter}</span>
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No links added.</p>
                  )}
                </div>
              )}
            </div>

            {/* My Problems */}
            <MyProblems />

            {/* Arena History */}
            <ArenaHistory />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-muted-foreground" />
                  Achievements
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {userStats ? achievementDefs.filter(a => a.check(userStats)).length : 0}/{achievementDefs.length}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {achievementDefs.map((achievement) => {
                  const Icon = achievement.icon;
                  const isUnlocked = userStats ? achievement.check(userStats) : false;
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                        isUnlocked ? "border-border bg-muted/30" : "border-border/50 opacity-40"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md shrink-0 ${isUnlocked ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`h-3.5 w-3.5 ${isUnlocked ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium truncate">{achievement.name}</span>
                          {isUnlocked && <CheckCircle2 className="h-3 w-3 text-success shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Account
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Display Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input value={profile?.email || user?.email || ""} disabled className="mt-1 h-9 bg-muted/30" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="mt-1 h-9"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Button onClick={handleSave} disabled={isLoading} size="sm">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Save
                </Button>
                <Button variant="ghost" onClick={handleSignOut} size="sm" className="text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
