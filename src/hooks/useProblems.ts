import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { TrendSignalDB, HiddenInsightDB } from "@/types/database";
import { mockMarketProblems, MarketProblem, TrendSignal } from "@/data/marketIntelligence";

// DB row type from Supabase (with Json types)
interface DBProblem {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  niche: string;
  sentiment: "exploding" | "rising" | "stable" | "declining";
  opportunity_score: number;
  market_size: string | null;
  demand_velocity: number;
  competition_gap: number;
  views: number;
  saves: number;
  shares: number;
  trending_rank: number | null;
  is_viral: boolean;
  slots_total: number;
  slots_filled: number;
  active_builders_last_24h: number;
  sources: unknown; // JSONB comes as unknown
  pain_points: string[];
  hidden_insight: unknown; // JSONB comes as unknown
  discovered_at: string;
  peak_prediction: string | null;
  created_at: string;
  updated_at: string;
}

// Convert DB problem to MarketProblem format for compatibility
function dbToMarketProblem(dbProblem: DBProblem): MarketProblem {
  // Parse JSONB sources
  const sources = Array.isArray(dbProblem.sources) 
    ? (dbProblem.sources as TrendSignalDB[]).map(s => ({
        source: s.source,
        metric: s.metric,
        value: s.value,
        change: 0,
      }))
    : [];

  // Parse JSONB hidden_insight
  const hiddenInsight = dbProblem.hidden_insight as HiddenInsightDB | null;

  return {
    id: dbProblem.id,
    title: dbProblem.title,
    subtitle: dbProblem.subtitle || "",
    category: dbProblem.category,
    niche: dbProblem.niche,
    sentiment: dbProblem.sentiment,
    opportunityScore: dbProblem.opportunity_score,
    marketSize: dbProblem.market_size || "",
    demandVelocity: dbProblem.demand_velocity,
    competitionGap: dbProblem.competition_gap,
    views: dbProblem.views,
    saves: dbProblem.saves,
    shares: dbProblem.shares,
    trendingRank: dbProblem.trending_rank || undefined,
    isViral: dbProblem.is_viral,
    slotsTotal: dbProblem.slots_total,
    slotsFilled: dbProblem.slots_filled,
    activeBuildersLast24h: dbProblem.active_builders_last_24h,
    sources,
    painPoints: dbProblem.pain_points || [],
    hiddenInsight: hiddenInsight || {
      surfaceAsk: "",
      realProblem: "",
      hiddenSignal: "",
    },
    discoveredAt: dbProblem.discovered_at,
    lastUpdated: dbProblem.updated_at,
    peakPrediction: dbProblem.peak_prediction || undefined,
  };
}

export function useProblems(category?: string) {
  return useQuery({
    queryKey: ["problems", category],
    queryFn: async () => {
      let query = supabase
        .from("problems")
        .select("*")
        .order("opportunity_score", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching problems:", error);
        return mockMarketProblems;
      }

      if (!data || data.length === 0) {
        return mockMarketProblems;
      }

      return (data as unknown as DBProblem[]).map(dbToMarketProblem);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching problem:", error);
        return mockMarketProblems.find(p => p.id === id) || null;
      }

      if (!data) {
        return mockMarketProblems.find(p => p.id === id) || null;
      }

      return dbToMarketProblem(data as unknown as DBProblem);
    },
    enabled: !!id,
  });
}
