// Database types matching Supabase schema
// These types mirror the database tables for frontend use

export type TrendSentiment = "exploding" | "rising" | "stable" | "declining";
export type TrendSource = "tiktok" | "google_trends" | "freelancer" | "reddit" | "hackernews";
export type ChallengeStatus = "active" | "voting" | "completed";
export type ChallengeDifficulty = "beginner" | "intermediate" | "advanced";
export type SubmissionStatus = "pending" | "validated" | "ranked" | "winner";
export type JoinType = "solo" | "team";

export interface TrendSignalDB {
  source: TrendSource;
  metric: string;
  value: string;
}

export interface HiddenInsightDB {
  surfaceAsk: string;
  realProblem: string;
  hiddenSignal: string;
}

export interface Problem {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  niche: string;
  sentiment: TrendSentiment;
  
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
  
  sources: TrendSignalDB[];
  pain_points: string[];
  hidden_insight: HiddenInsightDB | null;
  
  discovered_at: string;
  peak_prediction: string | null;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
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
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  tags: string[];
  
  why_relevant: string | null;
  sources: TrendSignalDB[];
  trend_growth: string | null;
  audience_size: string | null;
  
  problem_id: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  challenge_id: string | null;
  problem_id: string | null;
  
  product_name: string;
  product_url: string;
  demo_url: string | null;
  github_repo: string | null;
  stripe_public_key: string | null;
  supabase_project_url: string | null;
  
  join_type: JoinType;
  team_name: string | null;
  
  sentiment_fit_score: number | null;
  problem_coverage_percent: number | null;
  misalignment_warnings: string[] | null;
  
  has_revenue: boolean;
  revenue_amount: number | null;
  adoption_velocity_score: number | null;
  github_activity_score: number | null;
  
  total_score: number;
  ai_feedback: string | null;
  
  status: SubmissionStatus;
  validated_at: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface Ranking {
  id: string;
  challenge_id: string;
  submission_id: string;
  user_id: string;
  
  rank: number;
  previous_rank: number | null;
  
  total_score: number;
  sentiment_fit_score: number;
  problem_coverage_score: number;
  revenue_score: number;
  github_score: number;
  bonus_score: number;
  
  is_winner: boolean;
  prize_won: number;
  
  created_at: string;
  updated_at: string;
}

export interface ProblemBuilder {
  id: string;
  problem_id: string;
  user_id: string;
  joined_at: string;
  last_active_at: string;
}

// Helper types for forms
export interface SubmissionFormData {
  productName: string;
  productUrl: string;
  demoUrl?: string;
  githubRepo?: string;
  stripePublicKey?: string;
  supabaseProjectUrl?: string;
}

export interface ChallengeContext {
  id: string;
  title: string;
  trend: string;
  description: string;
  example: string | null;
  prizePool: number;
  winnerPrize: number;
  endsAt: string;
  difficulty: ChallengeDifficulty;
  tags: string[];
}
