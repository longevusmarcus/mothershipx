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
  Github,
  Twitter,
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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useUserStats, getXpProgress, getLevelTitle } from "@/hooks/useUserStats";
import { MyChallenges } from "@/components/MyChallenges";
import { useIsBuilderVerified } from "@/hooks/useBuilderVerification";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const achievements = [
  { id: 1, name: "First Build", description: "Submitted your first solution", unlocked: false, date: null, icon: Layers },
  { id: 2, name: "Problem Solver", description: "Solved 5 problems", unlocked: false, date: null, icon: Target },
  { id: 3, name: "Top 20", description: "Reached top 20 on leaderboard", unlocked: false, date: null, icon: Trophy },
  { id: 4, name: "Perfect Fit", description: "Achieved 95%+ fit score", unlocked: false, date: null, icon: Sparkles },
  { id: 5, name: "Revenue Maker", description: "First verified revenue", unlocked: false, date: null, icon: Award },
  { id: 6, name: "Elite Builder", description: "Reach top 10 on leaderboard", unlocked: false, date: null, icon: Trophy },
];

const recentBuilds: { id: number; name: string; problem: string; fitScore: number; status: string; date: string }[] = [];

export default function Profile() {
  const { user, profile, isAuthenticated, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
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
    linkedin: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        github: profile.github || "",
        twitter: profile.twitter || "",
        linkedin: "",
      });
    }
  }, [profile]);

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
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
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
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

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await updateProfile({ avatar_url: avatarUrl });

      if (updateError) throw updateError;

      toast.success("Avatar updated!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <AppLayout>
        <SEO title="Profile" description="View your builder profile." />
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage your profile</p>
          </motion.div>
          
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-lg font-medium mb-2">Not signed in</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Sign in to view your profile, track your progress, and manage your builds.
            </p>
            <Button onClick={() => setShowAuthModal(true)} size="sm">
              Sign In
            </Button>
          </div>
        </div>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </AppLayout>
    );
  }

  const xpProgress = userStats ? getXpProgress(userStats.totalXp) : { percentage: 0, currentLevelXp: 0, nextLevelXp: 500 };
  const levelTitle = userStats ? getLevelTitle(userStats.currentLevel) : "Newcomer";

  return (
    <AppLayout>
      <SEO title="Profile" description="View your builder profile, achievements, and build history." />
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your profile and track progress</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
              className="text-muted-foreground hover:text-foreground h-8 px-3"
            >
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Button>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isLoading}
              className="h-8 px-4"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isEditing ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Save
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <Avatar 
                className={`h-20 w-20 sm:h-24 sm:w-24 ${isEditing ? "cursor-pointer" : ""}`}
                onClick={handleAvatarClick}
              >
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "Avatar"} />
                <AvatarFallback className="text-xl font-semibold bg-gradient-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-5 w-5 text-background animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-background" />
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="text-lg font-semibold h-9 max-w-[240px]"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                    {profile?.name || "Builder"}
                  </h2>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-fit text-xs">
                    {levelTitle}
                  </Badge>
                  {isVerified && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="default" 
                          className="w-fit text-xs bg-primary/90 hover:bg-primary text-primary-foreground gap-1"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Verified Builder
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="text-xs">
                          This builder has verified their GitHub, Stripe, and Supabase credentials.
                          {verification?.verification_result?.overall?.score && (
                            <span className="block mt-1 text-muted-foreground">
                              Verification score: {verification.verification_result.overall.score}%
                            </span>
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                {formData.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {formData.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {joinedDate}
                </span>
              </div>

              {/* XP Progress */}
              <div className="max-w-sm">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Level {userStats?.currentLevel || 1}</span>
                  <span className="text-muted-foreground">
                    {userStats?.totalXp.toLocaleString() || 0} / {xpProgress.nextLevelXp.toLocaleString()} XP
                  </span>
                </div>
                <Progress value={xpProgress.percentage} className="h-1.5" />
              </div>
            </div>

            {/* Stats */}
            <div className="flex sm:flex-col gap-6 sm:gap-4 sm:border-l sm:border-border sm:pl-6">
              <div className="text-center sm:text-right">
                <div className="text-2xl font-semibold tabular-nums">
                  {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : userStats?.problemsJoined || 0}
                </div>
                <div className="text-xs text-muted-foreground">Problems Joined</div>
              </div>
              <div className="text-center sm:text-right opacity-50">
                <div className="text-2xl font-semibold tabular-nums">{userStats?.solutionsShipped || 0}</div>
                <div className="text-xs text-muted-foreground">Solutions</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-3">Overview</TabsTrigger>
            <TabsTrigger value="builds" className="text-xs sm:text-sm px-3">Builds</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm px-3">Achievements</TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm px-3">Account</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Bio & Links */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bio */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  About
                </h3>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Write a short bio about yourself..."
                    className="resize-none text-sm"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {formData.bio || "No bio added yet. Click Edit to add your bio."}
                  </p>
                )}
              </motion.div>

              {/* Links */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  Links
                </h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Website</Label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="yoursite.com"
                        className="h-9 text-sm mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">GitHub</Label>
                        <Input
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          placeholder="username"
                          className="h-9 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Twitter</Label>
                        <Input
                          value={formData.twitter}
                          onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                          placeholder="username"
                          className="h-9 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.website || formData.github || formData.twitter ? (
                      <>
                        {formData.website && (
                          <a 
                            href={`https://${formData.website}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {formData.website}
                          </a>
                        )}
                        {formData.github && (
                          <a 
                            href={`https://github.com/${formData.github}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Github className="h-3.5 w-3.5" />
                            {formData.github}
                          </a>
                        )}
                        {formData.twitter && (
                          <a 
                            href={`https://twitter.com/${formData.twitter}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Twitter className="h-3.5 w-3.5" />
                            @{formData.twitter}
                          </a>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No links added yet.</p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* My Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <MyChallenges />
            </motion.div>

            {/* Recent Builds */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Recent Builds
              </h3>
              {recentBuilds.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No builds yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Join a challenge to start building</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentBuilds.map((build) => (
                    <div
                      key={build.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{build.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{build.problem}</div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <Badge
                          variant={build.status === "verified" ? "default" : "secondary"}
                          className={`text-xs ${build.status === "verified" ? "bg-success/10 text-success border-success/20" : ""}`}
                        >
                          {build.status === "verified" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {build.fitScore}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">{build.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Builds Tab */}
          <TabsContent value="builds">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-center py-12">
                <Layers className="h-10 w-10 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-medium mb-2">Your Builds</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                  View all your submitted builds and their verification status.
                </p>
                <Button variant="outline" size="sm">
                  View All Builds
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  Achievements
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                        achievement.unlocked
                          ? "border-border bg-muted/20"
                          : "border-border/50 opacity-50"
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        achievement.unlocked ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          achievement.unlocked ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{achievement.name}</span>
                          {achievement.unlocked && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {achievement.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Account Settings
              </h3>
              <div className="space-y-4 max-w-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Display Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your display name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input 
                    value={profile?.email || user?.email || ""} 
                    type="email" 
                    disabled 
                    className="mt-1 bg-muted/30"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <Input 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={isLoading} size="sm">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut} 
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
