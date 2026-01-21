-- Create a function to insert paywall events (bypasses type checking issues)
CREATE OR REPLACE FUNCTION public.insert_paywall_event(
  p_user_id uuid,
  p_event_type text,
  p_feature text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.paywall_events (user_id, event_type, feature, metadata)
  VALUES (p_user_id, p_event_type, p_feature, p_metadata);
END;
$$;