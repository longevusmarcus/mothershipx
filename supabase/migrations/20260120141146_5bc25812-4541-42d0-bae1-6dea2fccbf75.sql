-- Create table to store builder verification credentials
CREATE TABLE public.builder_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  supabase_project_key text,
  stripe_public_key text,
  github_username text,
  verification_status text NOT NULL DEFAULT 'pending', -- pending, verified, failed
  verification_result jsonb, -- AI verification results
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.builder_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification
CREATE POLICY "Users can view their own verification"
ON public.builder_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own verification
CREATE POLICY "Users can create their own verification"
ON public.builder_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification
CREATE POLICY "Users can update their own verification"
ON public.builder_verifications
FOR UPDATE
USING (auth.uid() = user_id);