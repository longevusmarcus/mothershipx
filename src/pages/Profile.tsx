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
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Pencil,
  Check,
  Layers,
  Hash,
  CircleDot,
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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useUserStats, getXpProgress, getLevelTitle } from "@/hooks/useUserStats";
import { MyChallenges } from "@/components/MyChallenges";

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

  if (!isAuthenticated || !user) {
    return (
      <AppLayout>
        <SEO title="Profile" description="View your builder profile." />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <User className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-medium mb-2">Not signed in</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm">
            Sign in to view your profile, track your progress, and manage your builds.
          </p>
          <Button onClick={() => navigate("/auth")} className="rounded-full px-6">
            Sign In
          </Button>
        </div>
      </AppLayout>
    );
  }

  const xpProgress = userStats ? getXpProgress(userStats.totalXp) : { percentage: 0, currentLevelXp: 0, nextLevelXp: 500 };
  const levelTitle = userStats ? getLevelTitle(userStats.currentLevel) : "Newcomer";

  return (
    <AppLayout>
      <SEO title="Profile" description="View your builder profile, achievements, and build history." />
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Top Actions */}
          <div className="flex justify-end gap-2 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
              className="text-muted-foreground hover:text-foreground h-8 px-3 rounded-full"
            >
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Button>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isLoading}
              className="h-8 px-4 rounded-full"
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

          {/* Avatar & Name */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative group mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <Avatar 
                className={`h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-background shadow-lg ${
                  isEditing ? "cursor-pointer" : ""
                }`}
                onClick={handleAvatarClick}
              >
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "Avatar"} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-6 w-6 text-background animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-background" />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="text-center text-xl font-semibold h-10 max-w-[240px] mx-auto"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {profile?.name || "Builder"}
                </h1>
              )}
              
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                {formData.location && (
                  <>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {formData.location}
                    </span>
                    <span className="text-border">•</span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Level & XP Progress */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {userStats?.currentLevel || 1}
                </div>
                <span className="font-medium">{levelTitle}</span>
              </div>
              <span className="text-muted-foreground text-xs">
                {userStats?.totalXp.toLocaleString() || 0} / {xpProgress.nextLevelXp.toLocaleString()} XP
              </span>
            </div>
            <Progress value={xpProgress.percentage} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1.5 text-center">
              {userStats?.xpToNextLevel.toLocaleString() || 500} XP until next level
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl font-semibold tabular-nums">
                {statsLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : userStats?.problemsJoined || 0}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">Problems</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center relative"
            >
              <Badge variant="secondary" className="absolute -top-1 -right-1 text-[8px] px-1.5 py-0 hidden sm:flex">
                Soon
              </Badge>
              <div className="text-2xl sm:text-3xl font-semibold tabular-nums opacity-40">
                {userStats?.solutionsShipped || 0}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 opacity-60">Solutions</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center relative"
            >
              <Badge variant="secondary" className="absolute -top-1 -right-1 text-[8px] px-1.5 py-0 hidden sm:flex">
                Soon
              </Badge>
              <div className="text-2xl sm:text-3xl font-semibold tabular-nums opacity-40">
                #{userStats?.globalRank || 47}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 opacity-60">Rank</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-center relative"
            >
              <Badge variant="secondary" className="absolute -top-1 -right-1 text-[8px] px-1.5 py-0 hidden sm:flex">
                Soon
              </Badge>
              <div className="text-2xl sm:text-3xl font-semibold tabular-nums opacity-40">
                {userStats?.averageFitScore ? `${userStats.averageFitScore}%` : "89%"}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 opacity-60">Fit Score</div>
            </motion.div>
          </div>
        </motion.div>

        <Separator className="mb-8" />

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto bg-transparent border-b border-border rounded-none h-auto p-0 gap-6 justify-center">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none pb-3 px-1 text-sm font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="builds" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none pb-3 px-1 text-sm font-medium"
            >
              Builds
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none pb-3 px-1 text-sm font-medium"
            >
              Achievements
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none pb-3 px-1 text-sm font-medium"
            >
              Account
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Bio & Links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Bio */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
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
              </div>

              {/* Links */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5" />
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
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">GitHub</Label>
                        <Input
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          placeholder="username"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Twitter</Label>
                        <Input
                          value={formData.twitter}
                          onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                          placeholder="username"
                          className="h-9 text-sm"
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
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {formData.website}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                          </a>
                        )}
                        {formData.github && (
                          <a 
                            href={`https://github.com/${formData.github}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
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
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
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
              </div>
            </motion.div>

            {/* My Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MyChallenges />
            </motion.div>

            {/* Recent Builds */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" />
                Recent Builds
              </h3>
              {recentBuilds.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                  <Layers className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No builds yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Join a challenge to start building</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentBuilds.map((build) => (
                    <div
                      key={build.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-border transition-colors"
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
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium mb-2">Your Builds</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                View all your submitted builds and their verification status.
              </p>
              <Button variant="outline" size="sm" className="rounded-full px-5">
                View All Builds
              </Button>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-3.5 w-3.5" />
                Achievements
              </h3>
              <Badge variant="secondary" className="text-xs">
                {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
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
                      {achievement.unlocked && achievement.date && (
                        <p className="text-xs text-primary mt-1">{achievement.date}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <Label className="text-xs text-muted-foreground">Display Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your display name"
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input 
                  value={profile?.email || user?.email || ""} 
                  type="email" 
                  disabled 
                  className="mt-1.5 bg-muted/30"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Location</Label>
                <Input 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className="mt-1.5"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Button onClick={handleSave} disabled={isLoading} className="rounded-full px-6">
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
                  className="text-muted-foreground hover:text-destructive rounded-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
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
