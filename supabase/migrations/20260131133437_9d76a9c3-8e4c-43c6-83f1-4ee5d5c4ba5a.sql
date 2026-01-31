-- Drop the existing check constraint and recreate it with freelancer included
ALTER TABLE public.problem_evidence DROP CONSTRAINT IF EXISTS problem_evidence_source_check;

ALTER TABLE public.problem_evidence ADD CONSTRAINT problem_evidence_source_check 
CHECK (source IN ('tiktok', 'reddit', 'youtube', 'twitter', 'freelancer'));