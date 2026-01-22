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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Sparkles,
  Trophy,
  ExternalLink,
  ShieldCheck,
  Share2,
  Bell,
  Shield,
  Link2,
  Mail,
  Rocket,
  Github,
  X,
  Users,
  Lock,
  Globe,
  Trash2,
  AlertTriangle,
  Database,
  CreditCard,
  Zap,
  Crown,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useUserStats, getXpProgress, getLevelTitle } from "@/hooks/useUserStats";
import { useIsBuilderVerified } from "@/hooks/useBuilderVerification";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useSubscription, SUBSCRIPTION_PRICE } from "@/hooks/useSubscription";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MyProblems } from "@/components/MyProblems";
import { ArenaHistory } from "@/components/ArenaHistory";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { BuilderVerificationModal } from "@/components/BuilderVerificationModal";

// Achievement definitions
const achievementDefs = [
  { id: 1, name: "First Build", description: "Submitted your first solution", icon: Layers, check: (stats: any) => stats.solutionsShipped >= 1 },
  { id: 2, name: "Problem Solver", description: "Joined 5 problems", icon: Target, check: (stats: any) => stats.problemsJoined >= 5 },
  { id: 3, name: "Arena Warrior", description: "Entered 3 challenges", icon: Trophy, check: (stats: any) => stats.challengesEntered >= 3 },
  { id: 4, name: "Challenge Victor", description: "Won a challenge", icon: Award, check: (stats: any) => stats.challengesWon >= 1 },
  { id: 5, name: "Level 5", description: "Reached level 5", icon: Sparkles, check: (stats: any) => stats.currentLevel >= 5 },
  { id: 6, name: "Elite Builder", description: "Reach level 10", icon: Trophy, check: (stats: any) => stats.currentLevel >= 10 },
];

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  username: string | null;
  connectedAt: string | null;
}

export default function Profile() {
  const { user, profile, isAuthenticated, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { data: userStats } = useUserStats();
  const { isVerified, verification } = useIsBuilderVerified();
  const { settings, isLoading: settingsLoading, isSaving, hasChanges, updateSetting, saveSettings } = useUserSettings();
  const { hasPremiumAccess, subscriptionEnd, openCustomerPortal, isLoading: subLoading } = useSubscription();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
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
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "github",
      name: "GitHub",
      description: "Connect your repositories for build verification",
      icon: Github,
      connected: false,
      username: null,
      connectedAt: null,
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Verify revenue for your builds",
      icon: CreditCard,
      connected: false,
      username: null,
      connectedAt: null,
    },
    {
      id: "supabase",
      name: "Supabase",
      description: "Connect your database for usage metrics",
      icon: Database,
      connected: false,
      username: null,
      connectedAt: null,
    },
  ]);

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

  // Fetch existing verification data to show connected integrations
  useEffect(() => {
    const fetchVerificationData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from("builder_verifications").select("*").eq("user_id", user.id).single();

      if (data) {
        setIntegrations((prev) =>
          prev.map((integration) => {
            if (integration.id === "github" && data.github_username) {
              return {
                ...integration,
                connected: true,
                username: data.github_username,
                connectedAt: new Date(data.updated_at).toLocaleDateString(),
              };
            }
            if (integration.id === "stripe" && data.stripe_public_key) {
              return {
                ...integration,
                connected: true,
                username: data.stripe_public_key.slice(0, 12) + "...",
                connectedAt: new Date(data.updated_at).toLocaleDateString(),
              };
            }
            if (integration.id === "supabase" && data.supabase_project_key) {
              return {
                ...integration,
                connected: true,
                username: data.supabase_project_key.slice(0, 12) + "...",
                connectedAt: new Date(data.updated_at).toLocaleDateString(),
              };
            }
            return integration;
          }),
        );
      }
    };

    fetchVerificationData();
  }, []);

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
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await updateProfile({ avatar_url: publicUrl });
      if (updateError) throw updateError;
      
      toast.success("Avatar updated!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleShareProfile = async () => {
    if (!user) return;
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || "Builder"}'s Profile`,
          text: "Check out my builder profile!",
          url: profileUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(profileUrl);
          toast.success("Profile link copied!");
        }
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied!");
    }
  };

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error("Error opening portal:", error);
      toast.error("Could not open subscription portal. Please try again.");
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleConnect = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationComplete = () => {
    window.location.reload();
  };

  const handleDisconnect = async (integrationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updateData: Record<string, null> = {};
    if (integrationId === "github") updateData.github_username = null;
    if (integrationId === "stripe") updateData.stripe_public_key = null;
    if (integrationId === "supabase") updateData.supabase_project_key = null;

    const { error } = await supabase.from("builder_verifications").update(updateData).eq("user_id", user.id);

    if (!error) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integrationId ? { ...i, connected: false, username: null, connectedAt: null } : i)),
      );
      toast.success(`${integrationId} has been disconnected from your account.`);
    }
  };

  const handleExportData = async () => {
    toast.success("Your data export is being prepared. You'll receive a download link shortly.");
  };

  const handleDeleteBuilds = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "");

      if (error) throw error;
      toast.success("All your builds have been permanently deleted.");
    } catch (error) {
      console.error("Error deleting builds:", error);
      toast.error("Could not delete your builds. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.info("Please contact support to complete account deletion.");
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <SEO title="Profile" description="Your builder profile and achievements." />
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
      
      {/* Dot Grid Background */}
      <div className="relative">
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      
      {/* Main container with strict overflow control */}
      <div className="relative z-10 w-full max-w-full overflow-hidden space-y-4">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-5 overflow-hidden"
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
              {/* Name row with icons */}
              <div className="flex items-center justify-between gap-2">
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="font-display text-2xl font-normal tracking-tight h-10 flex-1"
                  />
                ) : (
                  <h2 className="font-display text-2xl font-normal tracking-tight truncate">{profile?.name || "Builder"}</h2>
                )}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleShareProfile}>
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={isEditing ? "default" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              
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
          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Level {userStats?.currentLevel || 1}</span>
              <span className="text-muted-foreground">{userStats?.totalXp || 0} / {xpProgress.nextLevelXp} XP</span>
            </div>
            <Progress value={xpProgress.percentage} className="h-1.5" />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start bg-secondary/50 p-1 h-10 overflow-x-auto rounded-lg">
            <TabsTrigger value="overview" className="text-xs px-3 h-8 data-[state=active]:bg-background">Overview</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs px-3 h-8 data-[state=active]:bg-background">Achievements</TabsTrigger>
            <TabsTrigger value="account" className="text-xs px-3 h-8 data-[state=active]:bg-background">Account</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs px-3 h-8 data-[state=active]:bg-background gap-1">
              <Bell className="h-3 w-3" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs px-3 h-8 data-[state=active]:bg-background gap-1">
              <Shield className="h-3 w-3" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs px-3 h-8 data-[state=active]:bg-background gap-1">
              <Link2 className="h-3 w-3" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="danger" className="text-xs px-3 h-8 data-[state=active]:bg-background gap-1">
              <AlertTriangle className="h-3 w-3" />
              Danger
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Bio */}
            <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                About
              </h3>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Short bio..."
                  className="resize-none text-sm bg-secondary/20"
                />
              ) : (
                <p className="text-sm text-muted-foreground break-words">
                  {formData.bio || "No bio yet."}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Links
              </h3>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="yoursite.com"
                    className="h-9 text-sm bg-secondary/20"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="GitHub"
                      className="h-9 text-sm bg-secondary/20"
                    />
                    <Input
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="Twitter"
                      className="h-9 text-sm bg-secondary/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {(formData.website || formData.github || formData.twitter) ? (
                    <>
                      {formData.website && (
                        <a href={`https://${formData.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors truncate group">
                          <LinkIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate group-hover:underline">{formData.website}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                      )}
                      {formData.github && (
                        <a href={`https://github.com/${formData.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors truncate group">
                          <LinkIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate group-hover:underline">github.com/{formData.github}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                      )}
                      {formData.twitter && (
                        <a href={`https://twitter.com/${formData.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors truncate group">
                          <LinkIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate group-hover:underline">@{formData.twitter}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground/60">No links added.</p>
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
            <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Achievements
                </h3>
                <span className="text-xs text-muted-foreground">
                  {userStats ? achievementDefs.filter(a => a.check(userStats)).length : 0}/{achievementDefs.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {achievementDefs.map((achievement) => {
                  const Icon = achievement.icon;
                  const isUnlocked = userStats ? achievement.check(userStats) : false;
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isUnlocked 
                          ? "border-primary/30 bg-primary/5" 
                          : "border-border/30 opacity-40"
                      }`}
                    >
                      <div className={`p-2 rounded-md shrink-0 ${isUnlocked ? "bg-primary/10" : "bg-muted/50"}`}>
                        <Icon className={`h-4 w-4 ${isUnlocked ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
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
            <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-4 space-y-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Account
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Display Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="mt-1.5 h-10 bg-secondary/20"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input value={profile?.email || user?.email || ""} disabled className="mt-1.5 h-10 bg-muted/20 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="mt-1.5 h-10 bg-secondary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button onClick={handleSave} disabled={isLoading} size="sm">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Save
                </Button>
                <Button variant="ghost" onClick={handleSignOut} size="sm" className="text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-4 space-y-4">
            {settingsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">Email Notifications</CardTitle>
                    <CardDescription className="text-xs">Choose which emails you'd like to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm">Daily Digest</Label>
                        <p className="text-xs text-muted-foreground">Receive a daily summary of platform activity</p>
                      </div>
                      <Switch checked={settings.email_digest} onCheckedChange={(checked) => updateSetting("email_digest", checked)} />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm flex items-center gap-2">
                          <Rocket className="h-3.5 w-3.5 text-primary" />
                          New Problems
                        </Label>
                        <p className="text-xs text-muted-foreground">Get notified when new problems are posted</p>
                      </div>
                      <Switch checked={settings.new_problems} onCheckedChange={(checked) => updateSetting("new_problems", checked)} />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm flex items-center gap-2">
                          <Trophy className="h-3.5 w-3.5 text-warning" />
                          Leaderboard Updates
                        </Label>
                        <p className="text-xs text-muted-foreground">Know when your rank changes</p>
                      </div>
                      <Switch checked={settings.leaderboard_updates} onCheckedChange={(checked) => updateSetting("leaderboard_updates", checked)} />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-success" />
                          Build Verification
                        </Label>
                        <p className="text-xs text-muted-foreground">Updates on your build verification status</p>
                      </div>
                      <Switch checked={settings.build_verification} onCheckedChange={(checked) => updateSetting("build_verification", checked)} />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm">Weekly Report</Label>
                        <p className="text-xs text-muted-foreground">Summary of your weekly progress and insights</p>
                      </div>
                      <Switch checked={settings.weekly_report} onCheckedChange={(checked) => updateSetting("weekly_report", checked)} />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm">Marketing Emails</Label>
                        <p className="text-xs text-muted-foreground">Product updates and promotional content</p>
                      </div>
                      <Switch checked={settings.marketing_emails} onCheckedChange={(checked) => updateSetting("marketing_emails", checked)} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">In-App Notifications</CardTitle>
                    <CardDescription className="text-xs">Configure how you receive notifications in the app</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm">Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch checked={settings.push_notifications} onCheckedChange={(checked) => updateSetting("push_notifications", checked)} />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm">In-App Alerts</Label>
                        <p className="text-xs text-muted-foreground">Show notification badges and alerts</p>
                      </div>
                      <Switch checked={settings.in_app_notifications} onCheckedChange={(checked) => updateSetting("in_app_notifications", checked)} />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={saveSettings} disabled={isSaving || !hasChanges} size="sm">
                    {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-4 space-y-4">
            {settingsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Globe className="h-4 w-4" />
                      Profile Visibility
                    </CardTitle>
                    <CardDescription className="text-xs">Control who can see your profile and activity</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm">Profile Status</Label>
                        <p className="text-xs text-muted-foreground">Who can view your profile page</p>
                      </div>
                      <Select value={settings.profile_visibility} onValueChange={(value) => updateSetting("profile_visibility", value as "public" | "builders" | "private")}>
                        <SelectTrigger className="w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public"><span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" />Public</span></SelectItem>
                          <SelectItem value="builders"><span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />Builders</span></SelectItem>
                          <SelectItem value="private"><span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" />Private</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5" />Show Email Address</Label>
                        <p className="text-xs text-muted-foreground">Display your email on your public profile</p>
                      </div>
                      <Switch checked={settings.show_email} onCheckedChange={(checked) => updateSetting("show_email", checked)} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm flex items-center gap-2"><Rocket className="h-3.5 w-3.5" />Show Builds</Label>
                        <p className="text-xs text-muted-foreground">Display your builds on your profile</p>
                      </div>
                      <Switch checked={settings.show_builds} onCheckedChange={(checked) => updateSetting("show_builds", checked)} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm flex items-center gap-2"><Zap className="h-3.5 w-3.5" />Show Stats</Label>
                        <p className="text-xs text-muted-foreground">Display your statistics publicly</p>
                      </div>
                      <Switch checked={settings.show_stats} onCheckedChange={(checked) => updateSetting("show_stats", checked)} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      Community Settings
                    </CardTitle>
                    <CardDescription className="text-xs">Manage how you interact with other builders</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm">Collaboration Requests</Label>
                        <p className="text-xs text-muted-foreground">Allow others to send you collab requests</p>
                      </div>
                      <Switch checked={settings.allow_collab_requests} onCheckedChange={(checked) => updateSetting("allow_collab_requests", checked)} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm flex items-center gap-2"><Trophy className="h-3.5 w-3.5 text-warning" />Leaderboard Visibility</Label>
                        <p className="text-xs text-muted-foreground">Appear on the public leaderboard</p>
                      </div>
                      <Switch checked={settings.show_on_leaderboard} onCheckedChange={(checked) => updateSetting("show_on_leaderboard", checked)} />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={saveSettings} disabled={isSaving || !hasChanges} size="sm">
                    {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Privacy Settings"}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-4 space-y-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Link2 className="h-4 w-4" />
                  Connected Services
                </CardTitle>
                <CardDescription className="text-xs">Connect external services to verify your builds</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {integrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-background border border-border/50">
                        <integration.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{integration.name}</span>
                          {integration.connected && (
                            <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-[10px]">
                              <Check className="h-2.5 w-2.5 mr-0.5" />Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{integration.description}</p>
                        {integration.connected && integration.username && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {integration.username} • {integration.connectedAt}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      {integration.connected ? (
                        <>
                          <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs">
                            <ExternalLink className="h-3 w-3" />View
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8" onClick={() => handleDisconnect(integration.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" onClick={handleConnect} className="h-8 text-xs">Connect</Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Crown className="h-4 w-4 text-warning" />
                  Subscription
                </CardTitle>
                <CardDescription className="text-xs">Manage your premium subscription</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {subLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : hasPremiumAccess ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border border-warning/20 bg-warning/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-warning/10 border border-warning/20">
                        <Crown className="h-4 w-4 text-warning" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">Premium Member</span>
                          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 text-[10px]">Active</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ${SUBSCRIPTION_PRICE}/month • {subscriptionEnd ? `Renews ${new Date(subscriptionEnd).toLocaleDateString()}` : "Active subscription"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleOpenPortal} disabled={isOpeningPortal} className="h-8 text-xs w-full sm:w-auto">
                      {isOpeningPortal ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <ExternalLinkIcon className="h-3 w-3 mr-1.5" />}
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-muted border border-border/50">
                        <Crown className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-sm block">Free Plan</span>
                        <p className="text-xs text-muted-foreground">Upgrade to unlock unlimited AI searches and more</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setShowPaywall(true)} className="h-8 text-xs w-full sm:w-auto">Upgrade to Premium</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-6">
                <div className="text-center">
                  <div className="p-2.5 rounded-full bg-muted/50 inline-block mb-2">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">More Integrations Coming Soon</h3>
                  <p className="text-xs text-muted-foreground">We're adding more services like Vercel, Railway, and Analytics.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="mt-4">
            <Card className="border-destructive/30">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-xs">Irreversible actions that affect your account</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div className="min-w-0">
                    <Label className="text-sm">Export Data</Label>
                    <p className="text-xs text-muted-foreground">Download all your data including builds and stats</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleExportData}>Export</Button>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div className="min-w-0">
                    <Label className="text-destructive text-sm">Delete All Builds</Label>
                    <p className="text-xs text-muted-foreground">Permanently delete all your submitted builds</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2 w-full sm:w-auto" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete Builds
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete all your builds and remove your submissions from our servers.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBuilds} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete All Builds</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-destructive/30 bg-destructive/10">
                  <div className="min-w-0">
                    <Label className="text-destructive text-sm">Delete Account</Label>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2 w-full sm:w-auto">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete your account, all your builds, settings, and data. This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Account</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
      <SubscriptionPaywall open={showPaywall} onOpenChange={setShowPaywall} />
      <BuilderVerificationModal open={showVerificationModal} onOpenChange={setShowVerificationModal} onVerified={handleVerificationComplete} />
    </AppLayout>
  );
}
