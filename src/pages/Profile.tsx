import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BarChart3,
  Hash,
  CircleDot,
  User,
  Link as LinkIcon,
  Github,
  Twitter,
  Linkedin,
  CheckCircle2,
  Award,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Trends Joined", value: 0, icon: CircleDot, comingSoon: false },
  { label: "Total Builds", value: 0, icon: Layers, comingSoon: true },
  { label: "Fit Score Avg", value: "-", icon: BarChart3, comingSoon: true },
  { label: "Global Rank", value: "-", icon: Hash, comingSoon: true },
];

const achievements = [
  { id: 1, name: "First Build", description: "Submitted your first solution", unlocked: false, date: null },
  { id: 2, name: "Problem Solver", description: "Solved 5 problems", unlocked: false, date: null },
  { id: 3, name: "Top 20", description: "Reached top 20 on leaderboard", unlocked: false, date: null },
  { id: 4, name: "Perfect Fit", description: "Achieved 95%+ fit score", unlocked: false, date: null },
  { id: 5, name: "Revenue Maker", description: "First verified revenue", unlocked: false, date: null },
  { id: 6, name: "Elite Builder", description: "Reach top 10 on leaderboard", unlocked: false, date: null },
];

const recentBuilds: { id: number; name: string; problem: string; fitScore: number; status: string; date: string }[] = [];

export default function Profile() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: "",
    location: "",
    website: "",
    github: "",
    twitter: "",
    linkedin: "",
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <AppLayout title="Profile">
        <SEO title="Profile" description="View your builder profile." />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Not signed in</h2>
          <p className="text-muted-foreground mb-6">Sign in to view your profile</p>
          <Button onClick={() => navigate("/problems")}>Browse Problems</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profile">
      <SEO title="Profile" description="View your builder profile, achievements, and build history." />
      <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            {/* Banner - Subtle gradient */}
            <div className="h-28 sm:h-36 bg-gradient-to-br from-secondary via-secondary to-muted relative">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)]" />
            </div>
            
            <CardContent className="relative pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-10 sm:-mt-14 mb-4 sm:mb-6">
                <Avatar className="h-20 w-20 sm:h-28 sm:w-28 border-4 border-background shadow-lg">
                  <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-primary text-primary-foreground">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 pt-2 sm:pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
                        <Badge variant="outline" className="text-[10px] sm:text-xs font-medium">
                          New Builder
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 mt-1 text-muted-foreground text-xs sm:text-sm">
                        {formData.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            {formData.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          Joined {user.joinedDate}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={isEditing ? handleSave : () => setIsEditing(true)}
                      className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      {isEditing ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Save
                        </>
                      ) : (
                        <>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium">Builder XP</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    0 / 500
                  </span>
                </div>
                <Progress value={0} className="h-1.5 sm:h-2" />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                  500 XP until next level
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/20 border border-border/30 ${stat.comingSoon ? 'overflow-hidden' : ''}`}
                  >
                    {stat.comingSoon && (
                      <div className="absolute top-1 right-1 z-20">
                        <Badge variant="secondary" className="text-[8px] px-1.5 py-0 bg-muted/80 backdrop-blur-sm">
                          Soon
                        </Badge>
                      </div>
                    )}
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1.5 sm:mb-2 text-muted-foreground ${stat.comingSoon ? 'opacity-40' : ''}`} />
                    <div className={`text-lg sm:text-2xl font-bold ${stat.comingSoon ? 'opacity-40 blur-[1px]' : ''}`}>{stat.value}</div>
                    <div className={`text-[10px] sm:text-xs text-muted-foreground leading-tight whitespace-nowrap ${stat.comingSoon ? 'opacity-60' : ''}`}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3">Overview</TabsTrigger>
            <TabsTrigger value="builds" className="text-xs sm:text-sm px-2 sm:px-3">Builds</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm px-2 sm:px-3">Achievements</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 sm:px-3">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bio Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="resize-none"
                      />
                    ) : (
                      <p className="text-muted-foreground">{formData.bio || "No bio added yet. Click Edit to add your bio."}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Links Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Website</Label>
                          <Input
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="yoursite.com"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">GitHub</Label>
                          <Input
                            value={formData.github}
                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                            placeholder="username"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Twitter</Label>
                          <Input
                            value={formData.twitter}
                            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                            placeholder="username"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {formData.website || formData.github || formData.twitter || formData.linkedin ? (
                          <>
                            {formData.website && (
                              <a href={`https://${formData.website}`} className="flex items-center gap-2 hover:text-foreground transition-colors mb-2">
                                <LinkIcon className="h-4 w-4" />
                                {formData.website}
                              </a>
                            )}
                            {formData.github && (
                              <a href={`https://github.com/${formData.github}`} className="flex items-center gap-2 hover:text-foreground transition-colors mb-2">
                                <Github className="h-4 w-4" />
                                {formData.github}
                              </a>
                            )}
                            {formData.twitter && (
                              <a href={`https://twitter.com/${formData.twitter}`} className="flex items-center gap-2 hover:text-foreground transition-colors mb-2">
                                <Twitter className="h-4 w-4" />
                                @{formData.twitter}
                              </a>
                            )}
                            {formData.linkedin && (
                              <a href={`https://linkedin.com/in/${formData.linkedin}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <Linkedin className="h-4 w-4" />
                                {formData.linkedin}
                              </a>
                            )}
                          </>
                        ) : (
                          <p>No links added yet. Click Edit to add your links.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="py-3 sm:py-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Recent Builds
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="space-y-2 sm:space-y-3">
                    {recentBuilds.map((build) => (
                      <div
                        key={build.id}
                        className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm sm:text-base truncate">{build.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{build.problem}</div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 ml-2">
                          <Badge
                            variant={build.status === "verified" ? "default" : "secondary"}
                            className={`text-[10px] sm:text-xs ${build.status === "verified" ? "bg-success/10 text-success border-success/20" : ""}`}
                          >
                            {build.status === "verified" && <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />}
                            {build.fitScore}%
                          </Badge>
                          <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">{build.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Builds Tab */}
          <TabsContent value="builds">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <Layers className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">View all your submitted builds and their verification status.</p>
                  <Button variant="outline" className="mt-4" size="sm">
                    View All Builds
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Achievements
                  <Badge variant="secondary" className="ml-2 text-[10px] sm:text-xs">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-2 sm:p-4 rounded-lg sm:rounded-xl border ${
                        achievement.unlocked
                          ? "bg-muted/30 border-border"
                          : "bg-muted/10 border-border/30 opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg shrink-0 ${
                          achievement.unlocked ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <CircleDot className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                            achievement.unlocked ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{achievement.name}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{achievement.description}</div>
                          {achievement.unlocked && achievement.date && (
                            <div className="text-[10px] sm:text-xs text-primary mt-0.5 sm:mt-1">{achievement.date}</div>
                          )}
                        </div>
                        {achievement.unlocked && (
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Display Name</Label>
                      <Input defaultValue={user.name} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input defaultValue={user.email} type="email" />
                    </div>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input defaultValue={formData.location} />
                  </div>
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Button>Save Settings</Button>
                      <Button variant="outline" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
