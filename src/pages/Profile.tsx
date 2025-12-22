import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  MapPin,
  Link as LinkIcon,
  Github,
  Twitter,
  Linkedin,
  Trophy,
  Rocket,
  Target,
  TrendingUp,
  Calendar,
  Edit3,
  Save,
  Award,
  Zap,
  Star,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

// Mock user data
const userData = {
  name: "Alex Chen",
  email: "alex@startup.io",
  avatar: "",
  initials: "AC",
  location: "San Francisco, CA",
  bio: "Serial entrepreneur & product builder. Passionate about solving real problems with elegant solutions. Previously built 2 YC-backed startups.",
  website: "alexchen.io",
  github: "alexchen",
  twitter: "alexbuilds",
  linkedin: "alexchen",
  joinedDate: "March 2024",
  tier: "Pro Builder",
  xp: 2450,
  nextLevelXp: 3000,
  rank: 12,
  totalBuilders: 1247,
};

const stats = [
  { label: "Problems Solved", value: 8, icon: Target, color: "text-emerald-500" },
  { label: "Total Builds", value: 12, icon: Rocket, color: "text-blue-500" },
  { label: "Fit Score Avg", value: "87%", icon: TrendingUp, color: "text-amber-500" },
  { label: "Leaderboard Rank", value: "#12", icon: Trophy, color: "text-purple-500" },
];

const achievements = [
  { id: 1, name: "First Build", description: "Submitted your first solution", icon: Rocket, unlocked: true, date: "Mar 15, 2024" },
  { id: 2, name: "Problem Solver", description: "Solved 5 problems", icon: Target, unlocked: true, date: "Apr 2, 2024" },
  { id: 3, name: "Top 20", description: "Reached top 20 on leaderboard", icon: Trophy, unlocked: true, date: "Apr 18, 2024" },
  { id: 4, name: "Perfect Fit", description: "Achieved 95%+ fit score", icon: Star, unlocked: true, date: "May 5, 2024" },
  { id: 5, name: "Revenue Maker", description: "First verified revenue", icon: Zap, unlocked: true, date: "May 20, 2024" },
  { id: 6, name: "Elite Builder", description: "Reach top 10 on leaderboard", icon: Award, unlocked: false, date: null },
];

const recentBuilds = [
  { id: 1, name: "DataSync Pro", problem: "API Integration Pain", fitScore: 92, status: "verified", date: "2 days ago" },
  { id: 2, name: "FormFlow", problem: "Form Abandonment", fitScore: 87, status: "verified", date: "1 week ago" },
  { id: 3, name: "MetricDash", problem: "Analytics Complexity", fitScore: 84, status: "pending", date: "2 weeks ago" },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    bio: userData.bio,
    location: userData.location,
    website: userData.website,
    github: userData.github,
    twitter: userData.twitter,
    linkedin: userData.linkedin,
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <AppLayout title="Profile">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-primary relative">
              <div className="absolute inset-0 bg-gradient-glow opacity-50" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
            </div>
            
            <CardContent className="relative pt-0 pb-6">
              {/* Avatar */}
              <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 mb-6">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={userData.avatar} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-primary text-primary-foreground">
                    {userData.initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 pt-4 md:pt-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{userData.name}</h1>
                        <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                          {userData.tier}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {userData.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Joined {userData.joinedDate}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={isEditing ? handleSave : () => setIsEditing(true)}
                      className="gap-2"
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Builder XP</span>
                  <span className="text-sm text-muted-foreground">
                    {userData.xp} / {userData.nextLevelXp} XP
                  </span>
                </div>
                <Progress value={(userData.xp / userData.nextLevelXp) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {userData.nextLevelXp - userData.xp} XP until next level
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="builds">My Builds</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
                      <p className="text-muted-foreground">{userData.bio}</p>
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
                      <>
                        <a href={`https://${userData.website}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <LinkIcon className="h-4 w-4" />
                          {userData.website}
                        </a>
                        <a href={`https://github.com/${userData.github}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Github className="h-4 w-4" />
                          {userData.github}
                        </a>
                        <a href={`https://twitter.com/${userData.twitter}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Twitter className="h-4 w-4" />
                          @{userData.twitter}
                        </a>
                        <a href={`https://linkedin.com/in/${userData.linkedin}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Linkedin className="h-4 w-4" />
                          {userData.linkedin}
                        </a>
                      </>
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
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Recent Builds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentBuilds.map((build) => (
                      <div
                        key={build.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium">{build.name}</div>
                          <div className="text-sm text-muted-foreground">{build.problem}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={build.status === "verified" ? "default" : "secondary"}
                            className={build.status === "verified" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
                          >
                            {build.status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {build.fitScore}% Fit
                          </Badge>
                          <span className="text-xs text-muted-foreground">{build.date}</span>
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
                <div className="text-center py-12 text-muted-foreground">
                  <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>View all your submitted builds and their verification status.</p>
                  <Button variant="outline" className="mt-4">
                    View All Builds
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                  <Badge variant="secondary" className="ml-2">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border ${
                        achievement.unlocked
                          ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
                          : "bg-muted/30 border-border/50 opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.unlocked ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <achievement.icon className={`h-5 w-5 ${
                            achievement.unlocked ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">{achievement.description}</div>
                          {achievement.unlocked && achievement.date && (
                            <div className="text-xs text-primary mt-1">{achievement.date}</div>
                          )}
                        </div>
                        {achievement.unlocked && (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
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
                    <Mail className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Display Name</Label>
                      <Input defaultValue={userData.name} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input defaultValue={userData.email} type="email" />
                    </div>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input defaultValue={userData.location} />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button>Save Settings</Button>
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
