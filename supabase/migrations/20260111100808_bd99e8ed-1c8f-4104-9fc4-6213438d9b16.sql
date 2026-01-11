-- Create user_settings table to store notification and privacy preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Notification settings
  email_digest BOOLEAN NOT NULL DEFAULT true,
  new_problems BOOLEAN NOT NULL DEFAULT true,
  leaderboard_updates BOOLEAN NOT NULL DEFAULT false,
  build_verification BOOLEAN NOT NULL DEFAULT true,
  weekly_report BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  in_app_notifications BOOLEAN NOT NULL DEFAULT true,
  -- Privacy settings
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'builders', 'private')),
  show_email BOOLEAN NOT NULL DEFAULT false,
  show_builds BOOLEAN NOT NULL DEFAULT true,
  show_stats BOOLEAN NOT NULL DEFAULT true,
  allow_collab_requests BOOLEAN NOT NULL DEFAULT true,
  show_on_leaderboard BOOLEAN NOT NULL DEFAULT true,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create settings when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to create settings for new users
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();