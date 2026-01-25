-- Add landing_page column to store generated landing page content
ALTER TABLE public.solutions
ADD COLUMN landing_page jsonb DEFAULT NULL;