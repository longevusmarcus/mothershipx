-- Create rate_limits table for tracking API requests
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_key TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint for identifier + endpoint + window_key
CREATE UNIQUE INDEX idx_rate_limits_unique 
  ON public.rate_limits(identifier, endpoint, window_key);

-- Create index for cleanup queries
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Enable RLS but allow service role to manage
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No client access - only edge functions with service role
CREATE POLICY "No client access to rate limits"
  ON public.rate_limits
  FOR ALL
  USING (false);

-- Function to check and increment rate limit (returns true if allowed)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 60,
  p_window_minutes INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_key TEXT;
  current_count INTEGER;
  result JSONB;
BEGIN
  -- Create a window key based on current minute
  v_window_key := to_char(date_trunc('minute', now()), 'YYYY-MM-DD-HH24-MI');
  
  -- Try to insert or update the rate limit record
  INSERT INTO public.rate_limits (identifier, endpoint, request_count, window_key, window_start)
  VALUES (p_identifier, p_endpoint, 1, v_window_key, now())
  ON CONFLICT (identifier, endpoint, window_key)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO current_count;
  
  -- Check if over limit
  IF current_count > p_max_requests THEN
    result := jsonb_build_object(
      'allowed', false,
      'current', current_count,
      'limit', p_max_requests,
      'retry_after', 60
    );
  ELSE
    result := jsonb_build_object(
      'allowed', true,
      'current', current_count,
      'limit', p_max_requests,
      'remaining', p_max_requests - current_count
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Cleanup function to remove old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.rate_limits
    WHERE window_start < now() - interval '1 hour'
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN COALESCE(deleted_count, 0);
END;
$$;