import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { mockMarketProblems, MarketProblem, TrendSignal, problemIdMap, getDbProblemId } from "@/data/marketIntelligence";

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

// Generic source from DB - can be TikTok/YouTube format or Reddit format
interface SourceFromDB {
  // TikTok/YouTube format
  source?: string;
  metric?: string;
  value?: string;
  change?: number;
  icon?: string;
  // Reddit format
  name?: string;
  trend?: string;
  mentions?: number;
  sentiment?: string;
}

interface HiddenInsightFromDB {
  surfaceAsk: string;
  realProblem: string;
  hiddenSignal: string;
}

// Reverse map: UUID -> mock ID
const uuidToMockId = Object.entries(problemIdMap).reduce((acc, [mockId, uuid]) => {
  acc[uuid] = mockId;
  return acc;
}, {} as Record<string, string>);

// Format numbers for display
function formatDbNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Convert DB problem to MarketProblem format for compatibility
function dbToMarketProblem(dbProblem: DBProblem): MarketProblem {
  // Parse JSONB sources - handle both TikTok/YouTube and Reddit formats
  let sources: TrendSignal[] = [];
  
  if (Array.isArray(dbProblem.sources)) {
    const rawSources = dbProblem.sources as SourceFromDB[];
    
    // Detect if this is a Reddit-only problem (has Reddit source with 'name' key or only Reddit sources)
    const hasRedditNameFormat = rawSources.some(s => s.name === 'reddit');
    const isRedditOnly = hasRedditNameFormat || 
      (rawSources.length === 1 && (rawSources[0].source === 'reddit' || rawSources[0].name === 'reddit'));
    
    if (isRedditOnly) {
      // For Reddit-only problems, show Reddit-specific metrics from views/shares
      const redditSource = rawSources.find(s => s.name === 'reddit' || s.source === 'reddit');
      const upvotes = dbProblem.views || 0;
      const comments = dbProblem.shares || 0;
      
      sources = [
        {
          source: 'reddit' as TrendSignal["source"],
          metric: 'Upvotes',
          value: formatDbNumber(upvotes),
          change: redditSource?.change || Math.round(40 + Math.random() * 40),
          icon: '⬆️',
        },
        {
          source: 'reddit' as TrendSignal["source"],
          metric: 'Comments',
          value: formatDbNumber(comments),
          change: Math.round(30 + Math.random() * 30),
          icon: '💬',
        }
      ];
    } else {
      // Standard multi-source format (TikTok/YouTube + Google Trends + Reddit mentions)
      sources = rawSources.map(s => {
        if (s.name === 'reddit' || s.source === 'reddit') {
          return {
            source: 'reddit' as TrendSignal["source"],
            metric: 'Mentions',
            value: s.trend || `${s.mentions || 0}+`,
            change: s.change || 0,
            icon: '💬',
          };
        }
        return {
          source: s.source as TrendSignal["source"],
          metric: s.metric || '',
          value: s.value || '',
          change: s.change || 0,
          icon: s.icon,
        };
      });
    }
  }

  // Parse JSONB hidden_insight
  const hiddenInsight = dbProblem.hidden_insight as HiddenInsightFromDB | null;

  // Use the mock ID if this is a known UUID, otherwise use the UUID
  const displayId = uuidToMockId[dbProblem.id] || dbProblem.id;

  return {
    id: displayId,
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

      if (category && category.toLowerCase() !== "all") {
        // Case-insensitive category filter
        query = query.ilike("category", category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching problems:", error);
        return mockMarketProblems;
      }

      if (!data || data.length === 0) {
        // If the user selected a category and it has no results, show an empty state
        // (do NOT fall back to mock data, which makes the filter appear broken).
        if (category && category.toLowerCase() !== "all") return [];

        // Only fall back to mock data when the whole table is empty (initial demo state).
        return mockMarketProblems;
      }

      return (data as unknown as DBProblem[]).map(dbToMarketProblem);
    },
    staleTime: 1000 * 60 * 2, // Fresh for 2 minutes
    gcTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      // Convert mock ID to database UUID if needed
      const dbId = getDbProblemId(id);
      
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("id", dbId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching problem:", error);
        // Fallback to mock data
        return mockMarketProblems.find(p => p.id === id) || null;
      }

      if (!data) {
        // Fallback to mock data if not found in DB
        return mockMarketProblems.find(p => p.id === id) || null;
      }

      return dbToMarketProblem(data as unknown as DBProblem);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}
