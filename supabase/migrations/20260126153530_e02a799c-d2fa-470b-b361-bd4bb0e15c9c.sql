-- Create table for storing scraped video evidence
CREATE TABLE public.problem_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('video', 'comment')),
  source TEXT NOT NULL CHECK (source IN ('tiktok', 'reddit', 'youtube', 'twitter')),
  
  -- Video fields
  video_url TEXT,
  video_thumbnail TEXT,
  video_title TEXT,
  video_author TEXT,
  video_author_avatar TEXT,
  video_views BIGINT DEFAULT 0,
  video_likes BIGINT DEFAULT 0,
  video_comments_count INTEGER DEFAULT 0,
  
  -- Comment fields
  comment_text TEXT,
  comment_author TEXT,
  comment_author_avatar TEXT,
  comment_upvotes INTEGER DEFAULT 0,
  comment_source_url TEXT,
  
  -- Metadata
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_problem_evidence_problem_id ON public.problem_evidence(problem_id);
CREATE INDEX idx_problem_evidence_type ON public.problem_evidence(evidence_type);

-- Enable RLS
ALTER TABLE public.problem_evidence ENABLE ROW LEVEL SECURITY;

-- Public read access (evidence supports trust-building, should be visible to all)
CREATE POLICY "Evidence is viewable by everyone"
  ON public.problem_evidence
  FOR SELECT
  USING (true);

-- Only service role can insert/update (edge functions)
CREATE POLICY "No direct client inserts"
  ON public.problem_evidence
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct client updates"
  ON public.problem_evidence
  FOR UPDATE
  USING (false);

CREATE POLICY "Admins can delete evidence"
  ON public.problem_evidence
  FOR DELETE
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));