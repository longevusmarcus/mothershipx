-- Create a table to store search interests from waitlist
CREATE TABLE public.search_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  user_id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_interests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous users too)
CREATE POLICY "Anyone can submit search interests"
ON public.search_interests
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view their own submissions
CREATE POLICY "Users can view their own search interests"
ON public.search_interests
FOR SELECT
USING (auth.uid() = user_id);

-- Create an index for analytics
CREATE INDEX idx_search_interests_created_at ON public.search_interests(created_at DESC);