-- Create user_activity table to track daily activity
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  activities_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view their own activity" 
ON public.user_activity 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own activity
CREATE POLICY "Users can insert their own activity" 
ON public.user_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own activity
CREATE POLICY "Users can update their own activity" 
ON public.user_activity 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add streak columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date date;

-- Create function to calculate streak
CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak_count integer := 0;
  check_date date := CURRENT_DATE;
  activity_exists boolean;
BEGIN
  -- Check consecutive days backwards from today
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.user_activity 
      WHERE user_id = p_user_id AND activity_date = check_date
    ) INTO activity_exists;
    
    IF activity_exists THEN
      streak_count := streak_count + 1;
      check_date := check_date - 1;
    ELSE
      -- If no activity today, check if yesterday had activity (streak not broken yet)
      IF check_date = CURRENT_DATE THEN
        check_date := check_date - 1;
        SELECT EXISTS (
          SELECT 1 FROM public.user_activity 
          WHERE user_id = p_user_id AND activity_date = check_date
        ) INTO activity_exists;
        
        IF activity_exists THEN
          streak_count := streak_count + 1;
          check_date := check_date - 1;
          CONTINUE;
        END IF;
      END IF;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$;

-- Create function to record activity and update streak
CREATE OR REPLACE FUNCTION public.record_user_activity(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_streak integer;
  prev_longest integer;
  result jsonb;
BEGIN
  -- Insert or update today's activity
  INSERT INTO public.user_activity (user_id, activity_date, activities_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET 
    activities_count = user_activity.activities_count + 1,
    updated_at = now();
  
  -- Calculate new streak
  new_streak := calculate_user_streak(p_user_id);
  
  -- Get previous longest streak
  SELECT COALESCE(longest_streak, 0) INTO prev_longest
  FROM public.profiles WHERE id = p_user_id;
  
  -- Update profile with new streak info
  UPDATE public.profiles
  SET 
    current_streak = new_streak,
    longest_streak = GREATEST(COALESCE(longest_streak, 0), new_streak),
    last_activity_date = CURRENT_DATE,
    updated_at = now()
  WHERE id = p_user_id;
  
  result := jsonb_build_object(
    'current_streak', new_streak,
    'longest_streak', GREATEST(prev_longest, new_streak),
    'is_new_record', new_streak > prev_longest
  );
  
  RETURN result;
END;
$$;

-- Create trigger to auto-record activity on key actions
CREATE OR REPLACE FUNCTION public.auto_record_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM record_user_activity(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Add triggers for activity tracking on key tables
CREATE TRIGGER record_activity_on_problem_join
AFTER INSERT ON public.problem_builders
FOR EACH ROW EXECUTE FUNCTION public.auto_record_activity();

CREATE TRIGGER record_activity_on_solution_create
AFTER INSERT ON public.solutions
FOR EACH ROW EXECUTE FUNCTION public.auto_record_activity();

CREATE TRIGGER record_activity_on_submission
AFTER INSERT ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.auto_record_activity();