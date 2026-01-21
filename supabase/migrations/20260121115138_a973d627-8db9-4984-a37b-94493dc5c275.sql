-- Add unique constraint on title for upsert to work
ALTER TABLE public.problems ADD CONSTRAINT problems_title_unique UNIQUE (title);