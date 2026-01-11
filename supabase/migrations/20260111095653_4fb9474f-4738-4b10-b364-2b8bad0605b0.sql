-- Create enums for status fields
CREATE TYPE public.trend_sentiment AS ENUM ('exploding', 'rising', 'stable', 'declining');
CREATE TYPE public.trend_source AS ENUM ('tiktok', 'google_trends', 'freelancer', 'reddit', 'hackernews');
CREATE TYPE public.challenge_status AS ENUM ('active', 'voting', 'completed');
CREATE TYPE public.challenge_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.submission_status AS ENUM ('pending', 'validated', 'ranked', 'winner');
CREATE TYPE public.join_type AS ENUM ('solo', 'team');

-- Problems & Trends table (market opportunities)
CREATE TABLE public.problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  niche TEXT NOT NULL,
  sentiment trend_sentiment NOT NULL DEFAULT 'stable',
  
  opportunity_score INTEGER NOT NULL DEFAULT 50 CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  market_size TEXT,
  demand_velocity INTEGER DEFAULT 0,
  competition_gap INTEGER DEFAULT 0,
  
  views BIGINT DEFAULT 0,
  saves BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  trending_rank INTEGER,
  is_viral BOOLEAN DEFAULT FALSE,
  
  slots_total INTEGER NOT NULL DEFAULT 20,
  slots_filled INTEGER NOT NULL DEFAULT 0,
  active_builders_last_24h INTEGER DEFAULT 0,
  
  sources JSONB DEFAULT '[]',
  pain_points TEXT[] DEFAULT '{}',
  hidden_insight JSONB,
  
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  peak_prediction TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  trend TEXT NOT NULL,
  description TEXT NOT NULL,
  example TEXT,
  
  entry_fee INTEGER NOT NULL DEFAULT 2,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  winner_prize INTEGER NOT NULL DEFAULT 0,
  
  participants INTEGER NOT NULL DEFAULT 0,
  solo_participants INTEGER NOT NULL DEFAULT 0,
  team_count INTEGER NOT NULL DEFAULT 0,
  
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  difficulty challenge_difficulty NOT NULL DEFAULT 'beginner',
  status challenge_status NOT NULL DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  
  why_relevant TEXT,
  sources JSONB DEFAULT '[]',
  trend_growth TEXT,
  audience_size TEXT,
  
  problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
  
  product_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  demo_url TEXT,
  github_repo TEXT,
  stripe_public_key TEXT,
  supabase_project_url TEXT,
  
  join_type join_type NOT NULL DEFAULT 'solo',
  team_name TEXT,
  
  sentiment_fit_score INTEGER CHECK (sentiment_fit_score >= 0 AND sentiment_fit_score <= 100),
  problem_coverage_percent INTEGER CHECK (problem_coverage_percent >= 0 AND problem_coverage_percent <= 100),
  misalignment_warnings TEXT[],
  
  has_revenue BOOLEAN DEFAULT FALSE,
  revenue_amount INTEGER,
  adoption_velocity_score INTEGER,
  github_activity_score INTEGER,
  
  total_score INTEGER DEFAULT 0,
  ai_feedback TEXT,
  
  status submission_status NOT NULL DEFAULT 'pending',
  validated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rankings table
CREATE TABLE public.rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rank INTEGER NOT NULL,
  previous_rank INTEGER,
  
  total_score INTEGER NOT NULL DEFAULT 0,
  sentiment_fit_score INTEGER DEFAULT 0,
  problem_coverage_score INTEGER DEFAULT 0,
  revenue_score INTEGER DEFAULT 0,
  github_score INTEGER DEFAULT 0,
  bonus_score INTEGER DEFAULT 0,
  
  is_winner BOOLEAN DEFAULT FALSE,
  prize_won INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(challenge_id, submission_id)
);

-- Builder activity on problems
CREATE TABLE public.problem_builders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(problem_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_builders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Problems are viewable by everyone" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users can view all submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Users can create their own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submissions" ON public.submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own submissions" ON public.submissions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Rankings are viewable by everyone" ON public.rankings FOR SELECT USING (true);
CREATE POLICY "Problem builders are viewable by everyone" ON public.problem_builders FOR SELECT USING (true);
CREATE POLICY "Users can join problems" ON public.problem_builders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave problems" ON public.problem_builders FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_problems_category ON public.problems(category);
CREATE INDEX idx_problems_sentiment ON public.problems(sentiment);
CREATE INDEX idx_problems_opportunity_score ON public.problems(opportunity_score DESC);
CREATE INDEX idx_challenges_status ON public.challenges(status);
CREATE INDEX idx_challenges_ends_at ON public.challenges(ends_at);
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_challenge_id ON public.submissions(challenge_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_rankings_challenge_id ON public.rankings(challenge_id);
CREATE INDEX idx_problem_builders_problem_id ON public.problem_builders(problem_id);
CREATE INDEX idx_problem_builders_user_id ON public.problem_builders(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON public.problems FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON public.rankings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle submission INSERT (update challenge counts)
CREATE OR REPLACE FUNCTION public.on_submission_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.challenge_id IS NOT NULL THEN
    UPDATE public.challenges
    SET 
      participants = participants + 1,
      solo_participants = CASE WHEN NEW.join_type = 'solo' THEN solo_participants + 1 ELSE solo_participants END,
      team_count = CASE WHEN NEW.join_type = 'team' THEN team_count + 1 ELSE team_count END,
      prize_pool = (participants + 1) * entry_fee,
      winner_prize = FLOOR(((participants + 1) * entry_fee) * 0.9)
    WHERE id = NEW.challenge_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to handle submission DELETE (update challenge counts)
CREATE OR REPLACE FUNCTION public.on_submission_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.challenge_id IS NOT NULL THEN
    UPDATE public.challenges
    SET 
      participants = GREATEST(0, participants - 1),
      solo_participants = CASE WHEN OLD.join_type = 'solo' THEN GREATEST(0, solo_participants - 1) ELSE solo_participants END,
      team_count = CASE WHEN OLD.join_type = 'team' THEN GREATEST(0, team_count - 1) ELSE team_count END,
      prize_pool = GREATEST(0, (participants - 1)) * entry_fee,
      winner_prize = FLOOR((GREATEST(0, (participants - 1)) * entry_fee) * 0.9)
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_submission_insert_trigger AFTER INSERT ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.on_submission_insert();
CREATE TRIGGER on_submission_delete_trigger AFTER DELETE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.on_submission_delete();

-- Function to update problem builder counts
CREATE OR REPLACE FUNCTION public.on_problem_builder_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.problems SET slots_filled = slots_filled + 1 WHERE id = NEW.problem_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_problem_builder_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.problems SET slots_filled = GREATEST(0, slots_filled - 1) WHERE id = OLD.problem_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_problem_builder_insert_trigger AFTER INSERT ON public.problem_builders FOR EACH ROW EXECUTE FUNCTION public.on_problem_builder_insert();
CREATE TRIGGER on_problem_builder_delete_trigger AFTER DELETE ON public.problem_builders FOR EACH ROW EXECUTE FUNCTION public.on_problem_builder_delete();