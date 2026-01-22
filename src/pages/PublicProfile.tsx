import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Calendar,
  Layers,
  User,
  Link as LinkIcon,
  Github,
  Award,
  Target,
  Sparkles,
  Trophy,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Share2,
  ArrowLeft,
  X,
  Zap,
  Crown,
  Users,
  CreditCard,
  Globe,
  Rocket,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getXpProgress, getLevelTitle } from "@/hooks/useUserStats";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AchievementBadge } from "@/components/AchievementBadge";

interface PublicProfile {
  id: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface PublicStats {
  problemsJoined: number;
  solutionsShipped: number;
  challengesEntered: number;
  challengesWon: number;
  totalXp: number;
  currentLevel: number;
  streak: number;
  longestStreak: number;
  squadsJoined: number;
  revenueEarned: number;
  viralProblemsJoined: number;
}

interface PublicBuild {
  id: string;
  product_name: string;
  product_url: string;
  demo_url: string | null;
  github_repo: string | null;
  status: string;
  created_at: string;
  challenge?: {
    title: string;
    id: string;
  };
  ranking?: {
    rank: number;
    is_winner: boolean;
    prize_won: number | null;
  };
}

interface JoinedProblem {
  id: string;
  title: string;
  category: string;
  sentiment: string;
  opportunity_score: number;
  joined_at: string;
}

const achievementDefs = [
  { id: 1, name: "First Build", description: "Submitted your first solution", icon: Layers, check: (stats: PublicStats) => stats.solutionsShipped >= 1 },
  { id: 2, name: "Problem Solver", description: "Joined 5 problems", icon: Target, check: (stats: PublicStats) => stats.problemsJoined >= 5 },
  { id: 3, name: "Arena Warrior", description: "Entered 3 challenges", icon: Trophy, check: (stats: PublicStats) => stats.challengesEntered >= 3 },
  { id: 4, name: "Challenge Victor", description: "Won a challenge", icon: Award, check: (stats: PublicStats) => stats.challengesWon >= 1 },
  { id: 5, name: "Level 5", description: "Reached level 5", icon: Sparkles, check: (stats: PublicStats) => stats.currentLevel >= 5 },
  { id: 6, name: "Elite Builder", description: "Reached level 10", icon: Crown, check: (stats: PublicStats) => stats.currentLevel >= 10 },
  { id: 7, name: "7-Day Streak", description: "Active for 7 consecutive days", icon: Zap, check: (stats: PublicStats) => (stats.streak || 0) >= 7 },
  { id: 8, name: "Collaborator", description: "Joined a squad team", icon: Users, check: (stats: PublicStats) => (stats.squadsJoined || 0) >= 1 },
  { id: 9, name: "Revenue Maker", description: "Earned first revenue", icon: CreditCard, check: (stats: PublicStats) => (stats.revenueEarned || 0) > 0 },
  { id: 10, name: "Prolific", description: "Shipped 10 solutions", icon: Rocket, check: (stats: PublicStats) => stats.solutionsShipped >= 10 },
  { id: 11, name: "Trendsetter", description: "Joined a viral problem", icon: Globe, check: (stats: PublicStats) => (stats.viralProblemsJoined || 0) >= 1 },
  { id: 12, name: "30-Day Streak", description: "Active for 30 consecutive days", icon: Zap, check: (stats: PublicStats) => (stats.streak || 0) >= 30 },
];

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [builds, setBuilds] = useState<PublicBuild[]>([]);
  const [problems, setProblems] = useState<JoinedProblem[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setIsLoading(true);

      // Check if userId is a UUID or username
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

      // Fetch profile using the secure public_profiles view
      const baseQuery = supabase.from("public_profiles" as never).select("*");
      
      const query = isUuid 
        ? baseQuery.eq("id", userId)
        : baseQuery.eq("username", userId.toLowerCase());

      const { data: profileData, error: profileError } = await query.single();

      if (profileError || !profileData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const typedProfile = profileData as unknown as PublicProfile;
      setProfile(typedProfile);

      const profileId = typedProfile.id;

      // Check visibility setting
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("profile_visibility, show_builds, show_stats")
        .eq("user_id", profileId)
        .single();

      // If profile is private, show not found
      if (settingsData?.profile_visibility === "private") {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // Fetch verification status
      const { data: verificationData } = await supabase
        .from("builder_verifications")
        .select("verification_status")
        .eq("user_id", profileId)
        .single();

      setIsVerified(verificationData?.verification_status === "verified");

      // Fetch stats if allowed
      if (settingsData?.show_stats !== false) {
        const [problemBuilders, submissions, challengeJoins, rankings, squadMembers, profileStreakData, viralProblems] = await Promise.all([
          supabase.from("problem_builders").select("id", { count: "exact" }).eq("user_id", profileId),
          supabase.from("submissions").select("id, revenue_amount", { count: "exact" }).eq("user_id", profileId),
          supabase.from("challenge_joins").select("id", { count: "exact" }).eq("user_id", profileId),
          supabase.from("rankings").select("id, is_winner").eq("user_id", profileId),
          supabase.from("squad_members").select("id", { count: "exact" }).eq("user_id", profileId),
          supabase.from("profiles").select("current_streak, longest_streak").eq("id", profileId).single(),
          supabase.from("problem_builders").select("problem_id, problems!inner(is_viral)").eq("user_id", profileId).eq("problems.is_viral", true),
        ]);

        const wins = rankings.data?.filter((r) => r.is_winner).length || 0;
        const revenueEarned = submissions.data?.reduce((sum, s) => sum + ((s as any).revenue_amount || 0), 0) || 0;

        // Calculate XP
        const problemsJoined = problemBuilders.count || 0;
        const solutionsShipped = submissions.count || 0;
        const challengesEntered = challengeJoins.count || 0;
        const totalXp = problemsJoined * 50 + solutionsShipped * 100 + challengesEntered * 75 + wins * 500;
        const currentLevel = Math.floor(totalXp / 500) + 1;

        setStats({
          problemsJoined,
          solutionsShipped,
          challengesEntered,
          challengesWon: wins,
          totalXp,
          currentLevel,
          streak: (profileStreakData.data as any)?.current_streak || 0,
          longestStreak: (profileStreakData.data as any)?.longest_streak || 0,
          squadsJoined: squadMembers.count || 0,
          revenueEarned,
          viralProblemsJoined: viralProblems.data?.length || 0,
        });
      }

      // Fetch problems joined
      const { data: problemBuildersData } = await supabase
        .from("problem_builders")
        .select(`
          joined_at,
          problems (id, title, category, sentiment, opportunity_score)
        `)
        .eq("user_id", profileId)
        .order("joined_at", { ascending: false })
        .limit(10);

      if (problemBuildersData) {
        const joinedProblems: JoinedProblem[] = problemBuildersData
          .filter((pb) => pb.problems)
          .map((pb) => ({
            id: (pb.problems as any).id,
            title: (pb.problems as any).title,
            category: (pb.problems as any).category,
            sentiment: (pb.problems as any).sentiment,
            opportunity_score: (pb.problems as any).opportunity_score,
            joined_at: pb.joined_at,
          }));
        setProblems(joinedProblems);
      }

      // Fetch builds if allowed
      if (settingsData?.show_builds !== false) {
        const { data: buildsData } = await supabase
          .from("submissions")
          .select(`
            id,
            product_name,
            product_url,
            demo_url,
            github_repo,
            status,
            created_at,
            challenge_id,
            challenges (id, title)
          `)
          .eq("user_id", profileId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (buildsData) {
          const submissionIds = buildsData.map((b) => b.id);
          const { data: rankingsData } = await supabase
            .from("rankings")
            .select("submission_id, rank, is_winner, prize_won")
            .in("submission_id", submissionIds);

          const buildsWithRankings: PublicBuild[] = buildsData.map((build) => ({
            id: build.id,
            product_name: build.product_name,
            product_url: build.product_url,
            demo_url: build.demo_url,
            github_repo: build.github_repo,
            status: build.status,
            created_at: build.created_at,
            challenge: build.challenges ? { id: (build.challenges as any).id, title: (build.challenges as any).title } : undefined,
            ranking: rankingsData?.find((r) => r.submission_id === build.id),
          }));

          setBuilds(buildsWithRankings);
        }
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.name || "Builder"}'s Profile`, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (notFound || !profile) {
    return (
      <AppLayout>
        <SEO title="Profile Not Found" />
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-lg font-medium mb-2">Profile Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This profile doesn't exist or is set to private.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const xpProgress = stats ? getXpProgress(stats.totalXp) : { percentage: 0, currentLevelXp: 0, nextLevelXp: 500 };
  const levelTitle = stats ? getLevelTitle(stats.currentLevel) : "Newcomer";

  const unlockedAchievements = stats ? achievementDefs.filter((a) => a.check(stats)) : [];
  const lockedAchievements = stats ? achievementDefs.filter((a) => !a.check(stats)) : achievementDefs;

  return (
    <AppLayout>
      <SEO
        title={`${profile.name || "Builder"}'s Profile`}
        description={profile.bio || `View ${profile.name}'s builder profile and achievements.`}
      />

      <div className="relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 h-32 bg-gradient-to-b from-primary/5 to-transparent" />

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground h-8 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        </motion.div>

        {/* Reddit-style two-column layout */}
        <div className="relative z-10 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          
          {/* Main Content - Left */}
          <div className="flex-1 min-w-0 space-y-4 order-2 lg:order-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-card border border-border/50 p-1 h-11 overflow-x-auto rounded-lg">
                <TabsTrigger value="overview" className="text-xs px-4 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">Overview</TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs px-4 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">Achievements</TabsTrigger>
                <TabsTrigger value="builds" className="text-xs px-4 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">Builds</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Problems Joined */}
                <Card className="border-border/50 bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      Problems Joined
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {problems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No problems joined yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {problems.map((problem) => (
                          <Link
                            key={problem.id}
                            to={`/problem/${problem.id}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{problem.title}</p>
                              <p className="text-xs text-muted-foreground">{problem.category}</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {problem.opportunity_score}% fit
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Arena History */}
                <Card className="border-border/50 bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      Arena History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {builds.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No arena submissions yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {builds.map((build) => (
                          <div
                            key={build.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">{build.product_name}</p>
                                {build.ranking?.is_winner && (
                                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                                    <Trophy className="h-2.5 w-2.5 mr-0.5" />
                                    Winner
                                  </Badge>
                                )}
                              </div>
                              {build.challenge && (
                                <p className="text-xs text-muted-foreground">{build.challenge.title}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {build.product_url && (
                                <a
                                  href={build.product_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {build.github_repo && (
                                <a
                                  href={build.github_repo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <Github className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="mt-4 space-y-4 overflow-visible">
                {/* Streak Card */}
                {stats && stats.streak > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-warning/30 bg-warning/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{stats.streak} Day Streak</p>
                          <p className="text-xs text-muted-foreground">Longest: {stats.longestStreak} days</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Trophy Case */}
                <Card className="border-border/50 bg-card overflow-visible">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      Trophy Case
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 overflow-visible">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 overflow-visible">
                      {achievementDefs.map((achievement, index) => {
                        const isUnlocked = stats ? achievement.check(stats) : false;
                        return (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <AchievementBadge
                              icon={achievement.icon}
                              name={achievement.name}
                              description={achievement.description}
                              isUnlocked={isUnlocked}
                              size="md"
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{unlockedAchievements.length} of {achievementDefs.length} unlocked</span>
                      <span>{Math.round((unlockedAchievements.length / achievementDefs.length) * 100)}% complete</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Builds Tab */}
              <TabsContent value="builds" className="mt-4">
                <Card className="border-border/50 bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      All Builds
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {builds.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No builds yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {builds.map((build) => (
                          <div
                            key={build.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{build.product_name}</span>
                                {build.ranking?.is_winner && (
                                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                                    <Trophy className="h-2.5 w-2.5 mr-0.5" />
                                    Winner
                                  </Badge>
                                )}
                                {build.ranking && !build.ranking.is_winner && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Rank #{build.ranking.rank}
                                  </Badge>
                                )}
                              </div>
                              {build.challenge && (
                                <Link
                                  to={`/challenges/${build.challenge.id}/results`}
                                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {build.challenge.title}
                                </Link>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {build.product_url && (
                                <a
                                  href={build.product_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  View
                                </a>
                              )}
                              {build.github_repo && (
                                <a
                                  href={build.github_repo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                  <Github className="h-3 w-3" />
                                  Code
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Right */}
          <div className="w-full lg:w-80 shrink-0 space-y-4 order-1 lg:order-2">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Banner */}
              <div className="h-16 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
              
              <div className="p-4 -mt-8">
                {/* Avatar */}
                <Avatar className="h-16 w-16 border-4 border-card mb-3">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || "Avatar"} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Username */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold">{profile.name || "Builder"}</h2>
                    {isVerified && (
                      <Badge variant="default" className="text-[10px] px-2 py-0.5 gap-0.5 rounded-full">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {profile.username && (
                    <p className="text-sm text-muted-foreground">u/{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {profile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {joinedDate}
                    </span>
                  </div>
                </div>

                {/* Level badge */}
                {stats && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-[10px]">
                      Level {stats.currentLevel} • {levelTitle}
                    </Badge>
                  </div>
                )}

                {/* XP Progress */}
                {stats && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{stats.totalXp.toLocaleString()} XP</span>
                      <span>{xpProgress.nextLevelXp.toLocaleString()} XP</span>
                    </div>
                    <Progress value={xpProgress.percentage} className="h-1.5" />
                  </div>
                )}

                {/* Share button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-9 text-xs font-medium gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share Profile
                </Button>

                {/* Stats grid - Reddit style */}
                {stats && (
                  <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-border/50">
                    <div>
                      <p className="text-lg font-semibold">{stats.totalXp}</p>
                      <p className="text-[11px] text-muted-foreground">XP</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stats.solutionsShipped}</p>
                      <p className="text-[11px] text-muted-foreground">Contributions</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{joinedDate.split(' ')[0]}</p>
                      <p className="text-[11px] text-muted-foreground">Joined</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stats.challengesWon}</p>
                      <p className="text-[11px] text-muted-foreground">Wins</p>
                    </div>
                  </div>
                )}

                {/* Achievement summary */}
                {stats && (
                  <>
                    <Separator className="opacity-50 my-4" />
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-medium text-primary uppercase tracking-wider">Achievements</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {achievementDefs.slice(0, 5).map((achievement) => {
                            const isUnlocked = achievement.check(stats);
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
                        {unlockedAchievements.length} unlocked
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Social Links Card */}
            {(profile.website || profile.github || profile.twitter) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-[11px] font-medium text-primary uppercase tracking-wider mb-3">Social Links</h3>
                
                <div className="flex flex-wrap gap-2">
                  {profile.website && (
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-xs"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={`https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-xs"
                    >
                      <Github className="h-3 w-3" />
                      {profile.github}
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-xs"
                    >
                      <X className="h-3 w-3" />
                      @{profile.twitter}
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
