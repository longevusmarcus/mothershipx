import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Bell,
  Shield,
  Link2,
  Mail,
  MessageSquare,
  Trophy,
  Rocket,
  Github,
  ExternalLink,
  Check,
  X,
  Users,
  Lock,
  Globe,
  Trash2,
  AlertTriangle,
  Database,
  CreditCard,
  Zap,
  Loader2,
  LogIn,
  Crown,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, SUBSCRIPTION_PRICE } from "@/hooks/useSubscription";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthModal } from "@/components/AuthModal";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { BuilderVerificationModal } from "@/components/BuilderVerificationModal";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  username: string | null;
  connectedAt: string | null;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { settings, isLoading, isSaving, hasChanges, isAuthenticated, updateSetting, saveSettings } = useUserSettings();

  const { hasPremiumAccess, subscriptionEnd, openCustomerPortal, isLoading: subLoading } = useSubscription();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
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

  // Fetch existing verification data to show connected integrations
  useEffect(() => {
    const fetchVerificationData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error("Error opening portal:", error);
      toast({
        title: "Error",
        description: "Could not open subscription portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleConnect = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationComplete = () => {
    // Refresh integration data
    window.location.reload();
  };

  const handleDisconnect = async (integrationId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      toast({
        title: "Disconnected",
        description: `${integrationId} has been disconnected from your account.`,
      });
    }
  };

  const handleExportData = async () => {
    toast({
      title: "Export started",
      description: "Your data export is being prepared. You'll receive a download link shortly.",
    });
  };

  const handleDeleteBuilds = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "");

      if (error) throw error;

      toast({
        title: "Builds deleted",
        description: "All your builds have been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting builds:", error);
      toast({
        title: "Error",
        description: "Could not delete your builds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast({
      title: "Account deletion requested",
      description: "Please contact support to complete account deletion.",
    });
  };

  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="p-4 rounded-full bg-muted/50 inline-block">
                <LogIn className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Sign in required</h2>
              <p className="text-muted-foreground">Please sign in to access your settings.</p>
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Dot Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage your notifications, privacy, and connected services
            </p>
          </div>

          {isLoading ? (
            <SettingsSkeleton />
          ) : (
            <Tabs defaultValue="notifications" className="space-y-4 sm:space-y-6">
              <TabsList className="bg-secondary/30 backdrop-blur-sm border border-border/50 p-1 w-full justify-start overflow-x-auto flex-nowrap rounded-lg">
                <TabsTrigger
                  value="notifications"
                  className="gap-1.5 font-mono text-xs px-3 whitespace-nowrap data-[state=active]:bg-background"
                >
                  <Bell className="h-3.5 w-3.5" />
                  ./notifs
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="gap-1.5 font-mono text-xs px-3 whitespace-nowrap data-[state=active]:bg-background"
                >
                  <Shield className="h-3.5 w-3.5" />
                  ./privacy
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  className="gap-1.5 font-mono text-xs px-3 whitespace-nowrap data-[state=active]:bg-background"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  ./integs
                </TabsTrigger>
                <TabsTrigger
                  value="danger"
                  className="gap-1.5 font-mono text-xs px-3 whitespace-nowrap data-[state=active]:bg-background"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  ./danger
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-4 sm:p-5">
                    <CardTitle className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <span className="text-primary">&gt;</span>
                      email_notifications
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Choose which emails you'd like to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-mono text-sm">daily_digest</Label>
                        <p className="text-xs text-muted-foreground">Receive a daily summary of platform activity</p>
                      </div>
                      <Switch
                        checked={settings.email_digest}
                        onCheckedChange={(checked) => updateSetting("email_digest", checked)}
                      />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-mono text-sm flex items-center gap-2">
                          <Rocket className="h-3.5 w-3.5 text-primary" />
                          new_problems
                        </Label>
                        <p className="text-xs text-muted-foreground">Get notified when new problems are posted</p>
                      </div>
                      <Switch
                        checked={settings.new_problems}
                        onCheckedChange={(checked) => updateSetting("new_problems", checked)}
                      />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-mono text-sm flex items-center gap-2">
                          <Trophy className="h-3.5 w-3.5 text-warning" />
                          leaderboard_updates
                        </Label>
                        <p className="text-xs text-muted-foreground">Know when your rank changes</p>
                      </div>
                      <Switch
                        checked={settings.leaderboard_updates}
                        onCheckedChange={(checked) => updateSetting("leaderboard_updates", checked)}
                      />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-mono text-sm flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-success" />
                          build_verification
                        </Label>
                        <p className="text-xs text-muted-foreground">Updates on your build verification status</p>
                      </div>
                      <Switch
                        checked={settings.build_verification}
                        onCheckedChange={(checked) => updateSetting("build_verification", checked)}
                      />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-mono text-sm">weekly_report</Label>
                        <p className="text-xs text-muted-foreground">Summary of your weekly progress and insights</p>
                      </div>
                      <Switch
                        checked={settings.weekly_report}
                        onCheckedChange={(checked) => updateSetting("weekly_report", checked)}
                      />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-mono text-sm">marketing_emails</Label>
                        <p className="text-xs text-muted-foreground">Product updates and promotional content</p>
                      </div>
                      <Switch
                        checked={settings.marketing_emails}
                        onCheckedChange={(checked) => updateSetting("marketing_emails", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-4 sm:p-5">
                    <CardTitle className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <span className="text-primary">&gt;</span>
                      in_app_notifications
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Configure how you receive notifications in the app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-mono text-sm">push_notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch
                        checked={settings.push_notifications}
                        onCheckedChange={(checked) => updateSetting("push_notifications", checked)}
                      />
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex items-center justify-between gap-3 py-2">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-mono text-sm">in_app_alerts</Label>
                        <p className="text-xs text-muted-foreground">Show notification badges and alerts</p>
                      </div>
                      <Switch
                        checked={settings.in_app_notifications}
                        onCheckedChange={(checked) => updateSetting("in_app_notifications", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button onClick={saveSettings} disabled={isSaving || !hasChanges} size="sm" className="font-mono">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        saving...
                      </>
                    ) : (
                      "./save"
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                      Profile Visibility
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Control who can see your profile and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-medium text-sm">Profile Status</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">Who can view your profile page</p>
                      </div>
                      <Select
                        value={settings.profile_visibility}
                        onValueChange={(value) =>
                          updateSetting("profile_visibility", value as "public" | "builders" | "private")
                        }
                      >
                        <SelectTrigger className="w-28 sm:w-40 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <span className="flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5" />
                              Public
                            </span>
                          </SelectItem>
                          <SelectItem value="builders">
                            <span className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5" />
                              Builders
                            </span>
                          </SelectItem>
                          <SelectItem value="private">
                            <span className="flex items-center gap-2">
                              <Lock className="h-3.5 w-3.5" />
                              Private
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-medium text-sm flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Show Email Address
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Display your email on your public profile
                        </p>
                      </div>
                      <Switch
                        checked={settings.show_email}
                        onCheckedChange={(checked) => updateSetting("show_email", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-medium text-sm flex items-center gap-2">
                          <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Show Builds
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">Display your builds on your profile</p>
                      </div>
                      <Switch
                        checked={settings.show_builds}
                        onCheckedChange={(checked) => updateSetting("show_builds", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-medium text-sm flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Show Stats
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">Display your statistics publicly</p>
                      </div>
                      <Switch
                        checked={settings.show_stats}
                        onCheckedChange={(checked) => updateSetting("show_stats", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      Community Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Manage how you interact with other builders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-medium text-sm">Collaboration Requests</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Allow others to send you collab requests
                        </p>
                      </div>
                      <Switch
                        checked={settings.allow_collab_requests}
                        onCheckedChange={(checked) => updateSetting("allow_collab_requests", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="font-medium text-sm flex items-center gap-2">
                          <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                          Leaderboard Visibility
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">Appear on the public leaderboard</p>
                      </div>
                      <Switch
                        checked={settings.show_on_leaderboard}
                        onCheckedChange={(checked) => updateSetting("show_on_leaderboard", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button onClick={saveSettings} disabled={isSaving || !hasChanges} size="sm" className="text-sm">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Privacy Settings"
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Integrations Tab */}
              <TabsContent value="integrations" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Link2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      Connected Services
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Connect external services to verify your builds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                    {integrations.map((integration, index) => (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-2.5 rounded-xl bg-background border border-border/50">
                            <integration.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm sm:text-base">{integration.name}</span>
                              {integration.connected && (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] sm:text-xs"
                                >
                                  <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                  Connected
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {integration.description}
                            </p>
                            {integration.connected && integration.username && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                                {integration.username} • {integration.connectedAt}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-auto sm:ml-0">
                          {integration.connected ? (
                            <>
                              <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs sm:text-sm">
                                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                onClick={() => handleDisconnect(integration.name)}
                              >
                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleConnect}
                              className="h-8 text-xs sm:text-sm"
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Subscription Management */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                      Subscription
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Manage your premium subscription</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    {subLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : hasPremiumAccess ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm sm:text-base">Premium Member</span>
                              <Badge
                                variant="secondary"
                                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] sm:text-xs"
                              >
                                Active
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              ${SUBSCRIPTION_PRICE}/month •{" "}
                              {subscriptionEnd
                                ? `Renews ${new Date(subscriptionEnd).toLocaleDateString()}`
                                : "Active subscription"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenPortal}
                          disabled={isOpeningPortal}
                          className="h-8 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          {isOpeningPortal ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          ) : (
                            <ExternalLinkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                          )}
                          Manage Subscription
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-xl border border-border/50 bg-muted/20">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-2.5 rounded-xl bg-muted border border-border/50">
                            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-sm sm:text-base block">Free Plan</span>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Upgrade to unlock unlimited AI searches and more
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setShowPaywall(true)}
                          className="h-8 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="py-6 sm:py-8">
                    <div className="text-center">
                      <div className="p-2.5 sm:p-3 rounded-full bg-muted/50 inline-block mb-2 sm:mb-3">
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-sm sm:text-base mb-1">More Integrations Coming Soon</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        We're adding more services like Vercel, Railway, and Analytics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Danger Zone Tab */}
              <TabsContent value="danger" className="space-y-4 sm:space-y-6">
                <Card className="border-destructive/30">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Irreversible actions that affect your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                      <div className="min-w-0">
                        <Label className="font-medium text-sm">Export Data</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Download all your data including builds and stats
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleExportData}>
                        Export
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                      <div className="min-w-0">
                        <Label className="font-medium text-destructive text-sm">Delete All Builds</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Permanently delete all your submitted builds
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2 w-full sm:w-auto"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            )}
                            Delete Builds
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete all your builds and remove your
                              submissions from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteBuilds}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete All Builds
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-destructive/30 bg-destructive/10">
                      <div className="min-w-0">
                        <Label className="font-medium text-destructive text-sm">Delete Account</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-2 w-full sm:w-auto">
                            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete your account, all your builds, settings, and data. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
      <SubscriptionPaywall open={showPaywall} onOpenChange={setShowPaywall} />
      <BuilderVerificationModal
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onVerified={handleVerificationComplete}
      />
    </AppLayout>
  );
}
