-- Create cache table for AI-analyzed search results
CREATE TABLE public.search_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  niche text NOT NULL,
  results jsonb NOT NULL,
  videos_analyzed integer NOT NULL DEFAULT 0,
  queries_used text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Create index for fast niche lookups
CREATE INDEX idx_search_cache_niche ON public.search_cache(niche);

-- Create index for expiry cleanup
CREATE INDEX idx_search_cache_expires ON public.search_cache(expires_at);

-- Enable RLS
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;

-- Cache is readable by everyone (public data)
CREATE POLICY "Search cache is viewable by everyone"
  ON public.search_cache
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (edge functions)
-- No user-facing policies for write operations

-- Add comment
COMMENT ON TABLE public.search_cache IS 'Caches AI-analyzed TikTok search results for 24 hours to reduce API costs';