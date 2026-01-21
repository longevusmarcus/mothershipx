-- Create table to track YouTube channel scans
CREATE TABLE public.channel_scans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id text NOT NULL UNIQUE,
  channel_name text NOT NULL,
  last_scanned_at timestamp with time zone NOT NULL DEFAULT now(),
  videos_analyzed integer NOT NULL DEFAULT 0,
  problems_found integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.channel_scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view scan history
CREATE POLICY "Channel scans are viewable by everyone"
  ON public.channel_scans FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_channel_scans_updated_at
  BEFORE UPDATE ON public.channel_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();