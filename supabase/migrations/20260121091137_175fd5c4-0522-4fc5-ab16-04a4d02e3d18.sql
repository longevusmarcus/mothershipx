-- Create table for tracking competitors over time
CREATE TABLE public.problem_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  rating INTEGER NOT NULL DEFAULT 0,
  rating_label TEXT NOT NULL DEFAULT 'Emerging',
  position INTEGER,
  previous_rating INTEGER,
  rating_change INTEGER DEFAULT 0,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(problem_id, url)
);

-- Enable RLS
ALTER TABLE public.problem_competitors ENABLE ROW LEVEL SECURITY;

-- Competitors are viewable by everyone
CREATE POLICY "Competitors are viewable by everyone"
ON public.problem_competitors
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_problem_competitors_problem_id ON public.problem_competitors(problem_id);
CREATE INDEX idx_problem_competitors_rating ON public.problem_competitors(rating DESC);

-- Trigger for updated_at
CREATE TRIGGER update_problem_competitors_updated_at
BEFORE UPDATE ON public.problem_competitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();