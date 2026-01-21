import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Layers,
  User,
  Link as LinkIcon,
  Github,
  Twitter,
  Award,
  Target,
  Sparkles,
  Trophy,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getXpProgress, getLevelTitle } from "@/hooks/useUserStats";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface PublicProfile {
  id: string;
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

const achievementDefs = [
  { id: 1, name: "First Build", description: "Submitted your first solution", icon: Layers, check: (stats: PublicStats) => stats.solutionsShipped >= 1 },
  { id: 2, name: "Problem Solver", description: "Joined 5 problems", icon: Target, check: (stats: PublicStats) => stats.problemsJoined >= 5 },
  { id: 3, name: "Arena Warrior", description: "Entered 3 challenges", icon: Trophy, check: (stats: PublicStats) => stats.challengesEntered >= 3 },
  { id: 4, name: "Challenge Victor", description: "Won a challenge", icon: Award, check: (stats: PublicStats) => stats.challengesWon >= 1 },
  { id: 5, name: "Level 5", description: "Reached level 5", icon: Sparkles, check: (stats: PublicStats) => stats.currentLevel >= 5 },
  { id: 6, name: "Elite Builder", description: "Reach level 10", icon: Trophy, check: (stats: PublicStats) => stats.currentLevel >= 10 },
];

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [builds, setBuilds] = useState<PublicBuild[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setIsLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setProfile(profileData);

      // Check visibility setting
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("profile_visibility, show_builds, show_stats")
        .eq("user_id", userId)
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
        .eq("user_id", userId)
        .single();

      setIsVerified(verificationData?.verification_status === "verified");

      // Fetch stats if allowed
      if (settingsData?.show_stats !== false) {
        const [problemBuilders, submissions, challengeJoins, rankings] = await Promise.all([
          supabase.from("problem_builders").select("id", { count: "exact" }).eq("user_id", userId),
          supabase.from("submissions").select("id", { count: "exact" }).eq("user_id", userId),
          supabase.from("challenge_joins").select("id", { count: "exact" }).eq("user_id", userId),
          supabase.from("rankings").select("id, is_winner").eq("user_id", userId),
        ]);

        const wins = rankings.data?.filter((r) => r.is_winner).length || 0;

        // Calculate XP (simplified version)
        const problemsJoined = problemBuilders.count || 0;
        const solutionsShipped = submissions.count || 0;
        const challengesEntered = challengeJoins.count || 0;
        const totalXp = problemsJoined * 50 + solutionsShipped * 100 + challengesEntered * 25 + wins * 500;
        const currentLevel = Math.floor(totalXp / 500) + 1;

        setStats({
          problemsJoined,
          solutionsShipped,
          challengesEntered,
          challengesWon: wins,
          totalXp,
          currentLevel,
        });
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
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (buildsData) {
          // Fetch rankings for these submissions
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
    month: "long",
    year: "numeric",
  });

  const xpProgress = stats ? getXpProgress(stats.totalXp) : { percentage: 0, currentLevelXp: 0, nextLevelXp: 500 };
  const levelTitle = stats ? getLevelTitle(stats.currentLevel) : "Newcomer";

  const unlockedAchievements = stats
    ? achievementDefs.filter((a) => a.check(stats))
    : [];

  return (
    <AppLayout>
      <SEO
        title={`${profile.name || "Builder"}'s Profile`}
        description={profile.bio || `View ${profile.name}'s builder profile and achievements.`}
      />
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 px-3"
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </Button>
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
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 shrink-0">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || "Avatar"} />
              <AvatarFallback className="text-xl font-semibold bg-gradient-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  {profile.name || "Builder"}
                </h2>
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
                          Verified
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Verified Builder credentials</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {joinedDate}
                </span>
              </div>

              {/* XP Progress */}
              {stats && (
                <div className="max-w-sm">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Level {stats.currentLevel}</span>
                    <span className="text-muted-foreground">
                      {stats.totalXp.toLocaleString()} / {xpProgress.nextLevelXp.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress value={xpProgress.percentage} className="h-1.5" />
                </div>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex sm:flex-col gap-6 sm:gap-4 sm:border-l sm:border-border sm:pl-6">
                <div className="text-center sm:text-right">
                  <div className="text-2xl font-semibold tabular-nums">{stats.problemsJoined}</div>
                  <div className="text-xs text-muted-foreground">Problems</div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-2xl font-semibold tabular-nums">{stats.solutionsShipped}</div>
                  <div className="text-xs text-muted-foreground">Solutions</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bio & Links */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bio */}
          {profile.bio && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                About
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            </motion.div>
          )}

          {/* Links */}
          {(profile.website || profile.github || profile.twitter) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                Links
              </h3>
              <div className="space-y-2">
                {profile.website && (
                  <a
                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    {profile.github}
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    @{profile.twitter}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Achievements */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              Achievements ({unlockedAchievements.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {unlockedAchievements.map((achievement) => (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger asChild>
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                      <achievement.icon className="h-5 w-5 text-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium text-xs">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </motion.div>
        )}

        {/* Builds */}
        {builds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Builds ({builds.length})
            </h3>
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
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
