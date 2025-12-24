import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Eye,
  EyeOff,
  Users,
  Lock,
  Globe,
  Trash2,
  AlertTriangle,
  Database,
  CreditCard,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock settings state
const initialNotificationSettings = {
  emailDigest: true,
  newProblems: true,
  leaderboardUpdates: false,
  buildVerification: true,
  weeklyReport: true,
  marketingEmails: false,
  pushNotifications: true,
  inAppNotifications: true,
};

const initialPrivacySettings = {
  profileVisibility: "public",
  showEmail: false,
  showBuilds: true,
  showStats: true,
  allowCollabRequests: true,
  showOnLeaderboard: true,
};

const integrations = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect your repositories for build verification",
    icon: Github,
    connected: true,
    username: "alexchen",
    connectedAt: "Mar 15, 2024",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Verify revenue for your builds",
    icon: CreditCard,
    connected: true,
    username: "alex@startup.io",
    connectedAt: "Apr 2, 2024",
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
];

export default function Settings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(initialNotificationSettings);
  const [privacy, setPrivacy] = useState(initialPrivacySettings);
  const [saving, setSaving] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy, value: boolean | string) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 1000);
  };

  const handleConnect = (integrationId: string) => {
    toast({
      title: "Connecting...",
      description: `Redirecting to ${integrationId} authorization...`,
    });
  };

  const handleDisconnect = (integrationId: string) => {
    toast({
      title: "Disconnected",
      description: `${integrationId} has been disconnected from your account.`,
    });
  };

  return (
    <AppLayout title="Settings">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your notifications, privacy, and connected services
            </p>
          </div>

          <Tabs defaultValue="notifications" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Notifications</span>
                <span className="xs:hidden">Notifs</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Integrations</span>
                <span className="xs:hidden">Integs</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Danger
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Choose which emails you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm">Daily Digest</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receive a daily summary of platform activity
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailDigest}
                      onCheckedChange={() => handleNotificationChange("emailDigest")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm flex items-center gap-2">
                        <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        New Problem Alerts
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Get notified when new problems are posted
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newProblems}
                      onCheckedChange={() => handleNotificationChange("newProblems")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                        Leaderboard Updates
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Know when your rank changes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.leaderboardUpdates}
                      onCheckedChange={() => handleNotificationChange("leaderboardUpdates")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                        Build Verification
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Updates on your build verification status
                      </p>
                    </div>
                    <Switch
                      checked={notifications.buildVerification}
                      onCheckedChange={() => handleNotificationChange("buildVerification")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm">Weekly Report</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Summary of your weekly progress and insights
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={() => handleNotificationChange("weeklyReport")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm">Marketing Emails</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Product updates and promotional content
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={() => handleNotificationChange("marketingEmails")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    In-App Notifications
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Configure how you receive notifications in the app
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm">Push Notifications</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={() => handleNotificationChange("pushNotifications")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm">In-App Alerts</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Show notification badges and alerts
                      </p>
                    </div>
                    <Switch
                      checked={notifications.inAppNotifications}
                      onCheckedChange={() => handleNotificationChange("inAppNotifications")}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="sm" className="text-sm">
                  {saving ? "Saving..." : "Save Preferences"}
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
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Who can view your profile page
                      </p>
                    </div>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
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
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => handlePrivacyChange("showEmail", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm flex items-center gap-2">
                        <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Show Builds
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Display your builds on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showBuilds}
                      onCheckedChange={(checked) => handlePrivacyChange("showBuilds", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Show Stats
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Display your statistics publicly
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showStats}
                      onCheckedChange={(checked) => handlePrivacyChange("showStats", checked)}
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
                      checked={privacy.allowCollabRequests}
                      onCheckedChange={(checked) => handlePrivacyChange("allowCollabRequests", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="font-medium text-sm flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                        Leaderboard Visibility
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Appear on the public leaderboard
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showOnLeaderboard}
                      onCheckedChange={(checked) => handlePrivacyChange("showOnLeaderboard", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="sm" className="text-sm">
                  {saving ? "Saving..." : "Save Privacy Settings"}
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
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] sm:text-xs">
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
                            onClick={() => handleConnect(integration.name)}
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
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Export</Button>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                    <div className="min-w-0">
                      <Label className="font-medium text-destructive text-sm">Delete All Builds</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Permanently delete all your submitted builds
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-2 w-full sm:w-auto">
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Delete Builds
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-destructive/30 bg-destructive/10">
                    <div className="min-w-0">
                      <Label className="font-medium text-destructive text-sm">Delete Account</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-2 w-full sm:w-auto">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}
