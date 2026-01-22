-- Create table for user-specific problem pins
CREATE TABLE public.user_problem_pins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  problem_id uuid NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  pinned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_problem_pins ENABLE ROW LEVEL SECURITY;

-- Users can only view their own pins
CREATE POLICY "Users can view their own pins"
ON public.user_problem_pins
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own pins
CREATE POLICY "Users can create their own pins"
ON public.user_problem_pins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own pins
CREATE POLICY "Users can delete their own pins"
ON public.user_problem_pins
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_problem_pins_user_id ON public.user_problem_pins(user_id);
CREATE INDEX idx_user_problem_pins_problem_id ON public.user_problem_pins(problem_id);