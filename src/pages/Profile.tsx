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
  Eye,
  ImageIcon,
  Plus,
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
import { useSubscription, SUBSCRIPTION_PRICE } from "@/contexts/SubscriptionContext";
import { useStreak } from "@/hooks/useStreak";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MyProblems } from "@/components/MyProblems";
import { ArenaHistory } from "@/components/ArenaHistory";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { BuilderVerificationModal } from "@/components/BuilderVerificationModal";
import { AchievementBadge } from "@/components/AchievementBadge";

// Achievement definitions
const achievementDefs = [
  { id: 1, name: "First Build", description: "Submitted your first solution", icon: Layers, check: (stats: any) => stats.solutionsShipped >= 1 },
  { id: 2, name: "Problem Solver", description: "Joined 5 problems", icon: Target, check: (stats: any) => stats.problemsJoined >= 5 },
  { id: 3, name: "Arena Warrior", description: "Entered 3 challenges", icon: Trophy, check: (stats: any) => stats.challengesEntered >= 3 },
  { id: 4, name: "Challenge Victor", description: "Won a challenge", icon: Award, check: (stats: any) => stats.challengesWon >= 1 },
  { id: 5, name: "Level 5", description: "Reached level 5", icon: Sparkles, check: (stats: any) => stats.currentLevel >= 5 },
  { id: 6, name: "Elite Builder", description: "Reached level 10", icon: Crown, check: (stats: any) => stats.currentLevel >= 10 },
  { id: 7, name: "7-Day Streak", description: "Active for 7 consecutive days", icon: Zap, check: (stats: any) => (stats.streak || 0) >= 7 },
  { id: 8, name: "Collaborator", description: "Joined a squad team", icon: Users, check: (stats: any) => (stats.squadsJoined || 0) >= 1 },
  { id: 9, name: "Revenue Maker", description: "Earned first revenue", icon: CreditCard, check: (stats: any) => (stats.revenueEarned || 0) > 0 },
  { id: 10, name: "Prolific", description: "Shipped 10 solutions", icon: Rocket, check: (stats: any) => stats.solutionsShipped >= 10 },
  { id: 11, name: "Trendsetter", description: "Joined a viral problem", icon: Globe, check: (stats: any) => (stats.viralProblemsJoined || 0) >= 1 },
  { id: 12, name: "30-Day Streak", description: "Active for 30 consecutive days", icon: Zap, check: (stats: any) => (stats.streak || 0) >= 30 },
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
  const { streakData } = useStreak();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    twitter: "",
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);
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
        username: (profile as any).username || "",
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

  const validateUsername = (username: string): string | null => {
    if (!username) return null;
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 30) return "Username must be 30 characters or less";
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return "Only letters, numbers, _ and - allowed";
    return null;
  };

  const handleSave = async () => {
    // Validate username
    const usernameValidation = validateUsername(formData.username);
    if (usernameValidation) {
      setUsernameError(usernameValidation);
      return;
    }
    setUsernameError(null);

    setIsLoading(true);
    
    // Check if username is taken (if changed)
    if (formData.username && formData.username !== (profile as any)?.username) {
      const { data: existing } = await supabase
        .from("profiles" as never)
        .select("id")
        .eq("username", formData.username.toLowerCase())
        .neq("id", user?.id || "")
        .single();
      
      if (existing) {
        setUsernameError("This username is already taken");
        setIsLoading(false);
        return;
      }
    }

    const { error } = await updateProfile({
      name: formData.name,
      username: formData.username.toLowerCase() || null,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      github: formData.github,
      twitter: formData.twitter,
    } as any);
    setIsLoading(false);
    if (!error) {
      setIsEditing(false);
      toast.success("Profile updated!");
    } else {
      if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        setUsernameError("This username is already taken");
      } else {
        toast.error("Failed to update profile");
      }
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
    // Use username if available, otherwise fall back to user id
    const profileIdentifier = (profile as any)?.username || user.id;
    const profileUrl = `${window.location.origin}/profile/${profileIdentifier}`;
    
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
      
      <div className="relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 h-32 bg-gradient-to-b from-primary/5 to-transparent" />
      
        {/* Reddit-style two-column layout */}
        <div className="relative z-10 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          
          {/* Main Content - Left (includes tabs + settings on mobile) */}
          <div className="flex-1 min-w-0 space-y-4 order-2 lg:order-1">
            <Tabs ref={tabsRef} value={activeTab} onValueChange={(v) => {
              setActiveTab(v);
              // On mobile, scroll to the tabs section instead of top
              if (tabsRef.current && window.innerWidth < 1024) {
                const offset = 80; // Account for fixed header
                const top = tabsRef.current.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: "smooth" });
              }
            }} className="w-full">
              <TabsList className="w-full justify-start bg-card border border-border/50 p-1 h-11 overflow-x-auto rounded-lg">
                <TabsTrigger value="overview" className="text-xs px-4 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">Overview</TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs px-4 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">Achievements</TabsTrigger>
                <TabsTrigger value="builds" className="text-xs px-4 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">Builds</TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs px-3 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium gap-1.5">
                  <Bell className="h-3 w-3" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="text-xs px-3 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium gap-1.5">
                  <Shield className="h-3 w-3" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="integrations" className="text-xs px-3 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium gap-1.5">
                  <Link2 className="h-3 w-3" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="danger" className="text-xs px-3 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium gap-1.5 text-destructive data-[state=active]:text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  Danger
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Subscription Management */}
                <Card className="border-border/50 bg-card">
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
                        <Button variant="outline" size="sm" onClick={() => openCustomerPortal()} className="h-8 text-xs w-full sm:w-auto">
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
                        <Button size="sm" onClick={() => setShowPaywall(true)} className="h-8 text-xs w-full sm:w-auto" data-testid="upgrade-button">Upgrade to Premium</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* My Problems */}
                <MyProblems />

                {/* Arena History */}
                <ArenaHistory />
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="mt-4 space-y-4 overflow-visible">
                {/* Streak Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/50 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent backdrop-blur-sm p-5 overflow-visible"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <motion.div 
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg"
                          animate={{ 
                            boxShadow: streakData.currentStreak > 0 
                              ? ["0 0 20px rgba(251,191,36,0.3)", "0 0 30px rgba(251,191,36,0.5)", "0 0 20px rgba(251,191,36,0.3)"]
                              : "0 0 0px transparent"
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Zap className="h-7 w-7 text-white" />
                        </motion.div>
                        {streakData.isActiveToday && (
                          <motion.div 
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center border-2 border-background"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{streakData.currentStreak}</p>
                        <p className="text-xs text-muted-foreground">day streak</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Best: {streakData.longestStreak} days</p>
                      <p className="text-xs text-muted-foreground/70">
                        {streakData.isActiveToday ? "Active today ✓" : "Be active to maintain!"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Trophy Case */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 overflow-visible"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-medium text-primary uppercase tracking-wider">
                      Trophy Case
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {userStats ? achievementDefs.filter(a => a.check(userStats)).length : 0} unlocked
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 overflow-visible">
                    {achievementDefs.map((achievement, index) => {
                      const isUnlocked = userStats ? achievement.check(userStats) : false;
                      return (
                        <motion.div 
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.03 * index }}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <AchievementBadge
                            icon={achievement.icon}
                            name={achievement.name}
                            description={achievement.description}
                            isUnlocked={isUnlocked}
                            size="sm"
                          />
                          <p className={`text-[9px] font-medium text-center leading-tight max-w-[50px] ${isUnlocked ? "text-foreground" : "text-muted-foreground/40"}`}>
                            {achievement.name}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Builds Tab */}
              <TabsContent value="builds" className="mt-4 space-y-4">
                <ArenaHistory />
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-4 space-y-4">
                {settingsLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <>
                    <Card className="border-border/50 bg-card">
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
                            <Label className="text-sm">Weekly Report</Label>
                            <p className="text-xs text-muted-foreground">Summary of your weekly progress and insights</p>
                          </div>
                          <Switch checked={settings.weekly_report} onCheckedChange={(checked) => updateSetting("weekly_report", checked)} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card">
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
                    <Card className="border-border/50 bg-card">
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
                            <Label className="text-sm">Show Builds</Label>
                            <p className="text-xs text-muted-foreground">Display your submitted builds publicly</p>
                          </div>
                          <Switch checked={settings.show_builds} onCheckedChange={(checked) => updateSetting("show_builds", checked)} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <Label className="text-sm">Show on Leaderboard</Label>
                            <p className="text-xs text-muted-foreground">Appear in public rankings</p>
                          </div>
                          <Switch checked={settings.show_on_leaderboard} onCheckedChange={(checked) => updateSetting("show_on_leaderboard", checked)} />
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

              {/* Integrations Tab */}
              <TabsContent value="integrations" className="mt-4 space-y-4">
                <Card className="border-border/50 bg-card">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Link2 className="h-4 w-4" />
                      Connected Services
                    </CardTitle>
                    <CardDescription className="text-xs">Connect external services for build verification and analytics</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    {integrations.map((integration, index) => (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-3 rounded-lg border ${integration.connected ? "border-success/30 bg-success/5" : "border-border/50"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg ${integration.connected ? "bg-success/10" : "bg-muted"}`}>
                            <integration.icon className={`h-4 w-4 ${integration.connected ? "text-success" : "text-muted-foreground"}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{integration.name}</span>
                              {integration.connected && <Badge variant="outline" className="text-[10px] text-success border-success/30 px-1.5 py-0">Connected</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{integration.connected ? integration.username : integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {integration.connected ? (
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs">
                              Disconnect
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setShowVerificationModal(true)} className="h-8 text-xs">Connect</Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
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

            {/* Mobile-only Settings Section - shown below tabs on mobile */}
            <div className="lg:hidden space-y-4">
              {/* Settings Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-[11px] font-medium text-primary uppercase tracking-wider mb-3">Settings</h3>
                
                <div className="space-y-1">
                  {/* Profile Settings */}
                  <div 
                    className="flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Profile</p>
                        <p className="text-[11px] text-muted-foreground truncate">Customize your profile</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="h-7 px-3 text-xs shrink-0">
                      {isEditing ? "Editing" : "Update"}
                    </Button>
                  </div>

                  {/* Privacy */}
                  <div 
                    className={`flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors ${activeTab === "privacy" ? "bg-muted/40" : ""}`}
                    onClick={() => setActiveTab("privacy")}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Curate your profile</p>
                        <p className="text-[11px] text-muted-foreground truncate">Manage visibility settings</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="h-7 px-3 text-xs shrink-0">
                      Update
                    </Button>
                  </div>

                  {/* Notifications */}
                  <div 
                    className={`flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors ${activeTab === "notifications" ? "bg-muted/40" : ""}`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Notifications</p>
                        <p className="text-[11px] text-muted-foreground truncate">Manage alerts</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="h-7 px-3 text-xs shrink-0">
                      Update
                    </Button>
                  </div>

                  {/* Integrations */}
                  <div 
                    className={`flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors ${activeTab === "integrations" ? "bg-muted/40" : ""}`}
                    onClick={() => setActiveTab("integrations")}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Integrations</p>
                        <p className="text-[11px] text-muted-foreground truncate">Connect services</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="h-7 px-3 text-xs shrink-0">
                      Update
                    </Button>
                  </div>

                  {/* Danger Zone */}
                  <div 
                    className={`flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-destructive/10 -mx-2 px-2 rounded-lg transition-colors ${activeTab === "danger" ? "bg-destructive/10" : ""}`}
                    onClick={() => setActiveTab("danger")}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-destructive">Danger Zone</p>
                        <p className="text-[11px] text-muted-foreground truncate">Delete data</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 px-3 text-xs shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10">
                      Update
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Subscription Card - mobile */}
              {!hasPremiumAccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border border-warning/30 bg-warning/5 p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-warning/20 flex items-center justify-center">
                      <Crown className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upgrade to Pro</p>
                      <p className="text-[11px] text-muted-foreground">Unlock unlimited features</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={() => setShowPaywall(true)}
                    data-testid="upgrade-button"
                  >
                    Upgrade Now
                  </Button>
                </motion.div>
              )}

              {/* Action buttons when editing - mobile */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-9"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 h-9"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar - Right (Reddit-style) */}
          <div className="w-full lg:w-80 shrink-0 order-1 lg:order-2 space-y-4">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Banner gradient */}
              <div className="h-16 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 bg-background/80 hover:bg-background"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              
              {/* Avatar overlapping banner */}
              <div className="px-4 -mt-10 relative z-10">
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                <div className="relative inline-block">
                  <Avatar 
                    className={`h-20 w-20 border-4 border-card ${isEditing ? "cursor-pointer" : ""}`} 
                    onClick={handleAvatarClick}
                  >
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "Avatar"} />
                    <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer" 
                      onClick={handleAvatarClick}
                    >
                      {isUploadingAvatar ? <Loader2 className="h-5 w-5 text-background animate-spin" /> : <Camera className="h-5 w-5 text-background" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile info */}
              <div className="p-4 pt-2 space-y-4">
                {/* Name and badges */}
                <div>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="font-semibold text-lg h-9 mb-1"
                    />
                  ) : (
                    <h2 className="font-semibold text-lg">{profile?.name || "Builder"}</h2>
                  )}
                  <p className="text-xs text-muted-foreground">
                    u/{(profile as any)?.username || user?.email?.split('@')[0] || "builder"}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">{levelTitle}</Badge>
                    {isVerified && (
                      <Badge variant="default" className="text-[10px] px-2 py-0.5 gap-0.5 rounded-full">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Share button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-9 text-xs font-medium gap-2"
                  onClick={handleShareProfile}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>

                {/* Logout button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-xs text-muted-foreground hover:text-destructive gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-3 w-3" />
                  Log out
                </Button>

                {/* Stats grid - Reddit style */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-lg font-semibold">{userStats?.totalXp || 0}</p>
                    <p className="text-[11px] text-muted-foreground">XP</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{userStats?.solutionsShipped || 0}</p>
                    <p className="text-[11px] text-muted-foreground">Contributions</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{joinedDate.split(' ')[0]}</p>
                    <p className="text-[11px] text-muted-foreground">Joined</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{userStats?.challengesWon || 0}</p>
                    <p className="text-[11px] text-muted-foreground">Wins</p>
                  </div>
                </div>

                {/* Achievement summary */}
                <Separator className="opacity-50" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-medium text-primary uppercase tracking-wider">Achievements</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {achievementDefs.slice(0, 5).map((achievement) => {
                        const isUnlocked = userStats ? achievement.check(userStats) : false;
                        const Icon = achievement.icon;
                        return (
                          <div
                            key={achievement.id}
                            className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-card ${
                              isUnlocked 
                                ? "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500" 
                                : "bg-muted/50 grayscale opacity-40"
                            }`}
                          >
                            <Icon className={`h-3 w-3 ${isUnlocked ? "text-white" : "text-muted-foreground"}`} />
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      +{achievementDefs.length - 5} more
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {userStats ? achievementDefs.filter(a => a.check(userStats)).length : 0} unlocked
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Social Links Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <h3 className="text-[11px] font-medium text-primary uppercase tracking-wider mb-3">Social Links</h3>
              
              <div className="flex flex-wrap gap-2">
                {formData.website && (
                  <a
                    href={`https://${formData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-xs"
                  >
                    <LinkIcon className="h-3 w-3" />
                    {formData.website}
                  </a>
                )}
                {formData.github && (
                  <a
                    href={`https://github.com/${formData.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-xs"
                  >
                    <Github className="h-3 w-3" />
                    {formData.github}
                  </a>
                )}
                {formData.twitter && (
                  <a
                    href={`https://twitter.com/${formData.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-xs"
                  >
                    <X className="h-3 w-3" />
                    @{formData.twitter}
                  </a>
                )}
                
                {isEditing ? (
                  <div className="w-full mt-2 space-y-2">
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="yoursite.com"
                      className="h-8 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        placeholder="GitHub username"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        placeholder="Twitter handle"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                ) : (!formData.website && !formData.github && !formData.twitter) && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    Add Social Link
                  </button>
                )}
              </div>
            </motion.div>

            {/* Settings Card - Desktop only */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="hidden lg:block rounded-xl border border-border bg-card p-4"
            >
              <h3 className="text-[11px] font-medium text-primary uppercase tracking-wider mb-3">Settings</h3>
              
              <div className="space-y-1">
                {/* Profile Settings */}
                <div 
                  className="flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Profile</p>
                      <p className="text-[11px] text-muted-foreground truncate">Customize your profile</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs shrink-0">
                    {isEditing ? "Editing" : "Update"}
                  </Button>
                </div>

                {/* Privacy */}
                <div 
                  className={`flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors ${activeTab === "privacy" ? "bg-muted/40" : ""}`}
                  onClick={() => setActiveTab("privacy")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Curate your profile</p>
                      <p className="text-[11px] text-muted-foreground truncate">Manage visibility settings</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs shrink-0">
                    Update
                  </Button>
                </div>

                {/* Notifications */}
                <div 
                  className={`flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors ${activeTab === "notifications" ? "bg-muted/40" : ""}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Notifications</p>
                      <p className="text-[11px] text-muted-foreground truncate">Manage alerts</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs shrink-0">
                    Update
                  </Button>
                </div>

                {/* Integrations */}
                <div 
                  className={`flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors ${activeTab === "integrations" ? "bg-muted/40" : ""}`}
                  onClick={() => setActiveTab("integrations")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Integrations</p>
                      <p className="text-[11px] text-muted-foreground truncate">Connect services</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs shrink-0">
                    Update
                  </Button>
                </div>

                {/* Danger Zone */}
                <div 
                  className={`flex items-center justify-between gap-3 py-2.5 cursor-pointer group hover:bg-destructive/10 -mx-2 px-2 rounded-lg transition-colors ${activeTab === "danger" ? "bg-destructive/10" : ""}`}
                  onClick={() => setActiveTab("danger")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-destructive">Danger Zone</p>
                      <p className="text-[11px] text-muted-foreground truncate">Delete data</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 px-3 text-xs shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10">
                    Update
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Subscription Card - Desktop only */}
            {!hasPremiumAccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:block rounded-xl border border-warning/30 bg-warning/5 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-warning/20 flex items-center justify-center">
                    <Crown className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upgrade to Pro</p>
                    <p className="text-[11px] text-muted-foreground">Unlock unlimited features</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => setShowPaywall(true)}
                  data-testid="upgrade-button"
                >
                  Upgrade Now
                </Button>
              </motion.div>
            )}

            {/* Action buttons when editing - Desktop only */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden lg:flex gap-2"
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 h-9"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </motion.div>
            )}

          </div>
        </div>
      </div>
      <SubscriptionPaywall open={showPaywall} onOpenChange={setShowPaywall} />
      <BuilderVerificationModal open={showVerificationModal} onOpenChange={setShowVerificationModal} onVerified={handleVerificationComplete} />
    </AppLayout>
  );
}
