import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { TrendSignalDB } from "@/types/database";
import { mockChallenges, DailyChallenge, ChallengeSource } from "@/data/challengesData";

// DB row type from Supabase
interface DBChallenge {
  id: string;
  title: string;
  trend: string;
  description: string;
  example: string | null;
  entry_fee: number;
  prize_pool: number;
  winner_prize: number;
  participants: number;
  solo_participants: number;
  team_count: number;
  starts_at: string;
  ends_at: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "active" | "voting" | "completed";
  tags: string[];
  why_relevant: string | null;
  sources: unknown; // JSONB
  trend_growth: string | null;
  audience_size: string | null;
  problem_id: string | null;
  created_at: string;
  updated_at: string;
}

// Convert DB challenge to DailyChallenge format
function dbToChallenge(dbChallenge: DBChallenge): DailyChallenge {
  const now = new Date();
  const endsAt = new Date(dbChallenge.ends_at);
  const isToday = now.toDateString() === endsAt.toDateString();
  
  // Parse JSONB sources
  const sources = Array.isArray(dbChallenge.sources) 
    ? (dbChallenge.sources as TrendSignalDB[]).map(s => ({
        source: s.source,
        metric: s.metric,
        value: s.value,
      } as ChallengeSource))
    : [];

  return {
    id: dbChallenge.id,
    title: dbChallenge.title,
    trend: dbChallenge.trend,
    description: dbChallenge.description,
    example: dbChallenge.example || "",
    prizePool: dbChallenge.prize_pool,
    participants: dbChallenge.participants,
    soloParticipants: dbChallenge.solo_participants,
    teamCount: dbChallenge.team_count,
    endsAt: endsAt,
    difficulty: dbChallenge.difficulty,
    tags: dbChallenge.tags || [],
    isToday,
    status: dbChallenge.status,
    winnerPrize: dbChallenge.winner_prize,
    whyRelevant: dbChallenge.why_relevant || "",
    sources,
    trendGrowth: dbChallenge.trend_growth || "",
    audienceSize: dbChallenge.audience_size || "",
  };
}

export function useChallenges(status?: DBChallenge["status"]) {
  return useQuery({
    queryKey: ["challenges", status],
    queryFn: async () => {
      let query = supabase
        .from("challenges")
        .select("*")
        .order("ends_at", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching challenges:", error);
        return mockChallenges;
      }

      if (!data || data.length === 0) {
        return mockChallenges;
      }

      return (data as unknown as DBChallenge[]).map(dbToChallenge);
    },
    staleTime: 1000 * 60,
  });
}

export function useChallenge(id: string) {
  return useQuery({
    queryKey: ["challenge", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching challenge:", error);
        return mockChallenges.find(c => c.id === id) || null;
      }

      if (!data) {
        return mockChallenges.find(c => c.id === id) || null;
      }

      return dbToChallenge(data as unknown as DBChallenge);
    },
    enabled: !!id,
  });
}

export function useTodayChallenge() {
  return useQuery({
    queryKey: ["challenge", "today"],
    queryFn: async () => {
      const now = new Date();
      
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("status", "active")
        .gt("ends_at", now.toISOString())
        .order("ends_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching today's challenge:", error);
        return mockChallenges.find(c => c.isToday) || null;
      }

      if (!data) {
        return mockChallenges.find(c => c.isToday) || null;
      }

      return dbToChallenge(data as unknown as DBChallenge);
    },
    staleTime: 1000 * 60,
  });
}

export function usePastChallenges() {
  return useQuery({
    queryKey: ["challenges", "past"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .neq("status", "active")
        .order("ends_at", { ascending: false });

      if (error) {
        console.error("Error fetching past challenges:", error);
        return mockChallenges.filter(c => !c.isToday);
      }

      if (!data || data.length === 0) {
        return mockChallenges.filter(c => !c.isToday);
      }

      return (data as unknown as DBChallenge[]).map(dbToChallenge);
    },
    staleTime: 1000 * 60 * 5,
  });
}
