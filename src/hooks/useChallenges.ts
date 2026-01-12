import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { TrendSignalDB } from "@/types/database";
import { DailyChallenge, ChallengeSource } from "@/data/challengesData";

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
        throw error;
      }

      return (data || []).map((c) => dbToChallenge(c as unknown as DBChallenge));
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
        return null;
      }

      if (!data) return null;

      return dbToChallenge(data as unknown as DBChallenge);
    },
    enabled: !!id,
  });
}

export function useTodayChallenge() {
  return useQuery({
    queryKey: ["challenge", "today"],
    queryFn: async () => {
      // First try to get an active challenge
      const { data: activeData, error: activeError } = await supabase
        .from("challenges")
        .select("*")
        .eq("status", "active")
        .order("ends_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (activeError) {
        console.error("Error fetching active challenge:", activeError);
        return null;
      }

      if (activeData) {
        return dbToChallenge(activeData as unknown as DBChallenge);
      }

      // If no active challenge, get the most recent voting challenge
      const { data: votingData, error: votingError } = await supabase
        .from("challenges")
        .select("*")
        .eq("status", "voting")
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (votingError) {
        console.error("Error fetching voting challenge:", votingError);
        return null;
      }

      if (votingData) {
        return dbToChallenge(votingData as unknown as DBChallenge);
      }

      return null;
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
        throw error;
      }

      return (data || []).map((c) => dbToChallenge(c as unknown as DBChallenge));
    },
    staleTime: 1000 * 60 * 5,
  });
}
