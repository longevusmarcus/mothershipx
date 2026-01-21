-- Fix challenge join triggers to not modify prize_pool and winner_prize
-- Prize pool should remain static at $1k (or whatever is set at challenge creation)

CREATE OR REPLACE FUNCTION public.on_challenge_join_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.challenges
  SET 
    participants = participants + 1,
    solo_participants = CASE WHEN NEW.join_type = 'solo' THEN solo_participants + 1 ELSE solo_participants END,
    team_count = CASE WHEN NEW.join_type = 'team' THEN team_count + 1 ELSE team_count END,
    updated_at = now()
  WHERE id = NEW.challenge_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_challenge_join_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.challenges
  SET 
    participants = GREATEST(0, participants - 1),
    solo_participants = CASE WHEN OLD.join_type = 'solo' THEN GREATEST(0, solo_participants - 1) ELSE solo_participants END,
    team_count = CASE WHEN OLD.join_type = 'team' THEN GREATEST(0, team_count - 1) ELSE team_count END,
    updated_at = now()
  WHERE id = OLD.challenge_id;

  RETURN OLD;
END;
$$;

-- Also fix the submission triggers for consistency
CREATE OR REPLACE FUNCTION public.on_submission_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.challenge_id IS NOT NULL THEN
    UPDATE public.challenges
    SET 
      participants = participants + 1,
      solo_participants = CASE WHEN NEW.join_type = 'solo' THEN solo_participants + 1 ELSE solo_participants END,
      team_count = CASE WHEN NEW.join_type = 'team' THEN team_count + 1 ELSE team_count END,
      updated_at = now()
    WHERE id = NEW.challenge_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_submission_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.challenge_id IS NOT NULL THEN
    UPDATE public.challenges
    SET 
      participants = GREATEST(0, participants - 1),
      solo_participants = CASE WHEN OLD.join_type = 'solo' THEN GREATEST(0, solo_participants - 1) ELSE solo_participants END,
      team_count = CASE WHEN OLD.join_type = 'team' THEN GREATEST(0, team_count - 1) ELSE team_count END,
      updated_at = now()
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN OLD;
END;
$$;

-- Set default prize_pool to 1000 for new challenges
ALTER TABLE public.challenges ALTER COLUMN prize_pool SET DEFAULT 1000;
ALTER TABLE public.challenges ALTER COLUMN winner_prize SET DEFAULT 900;

-- Update any challenges that have wrong prize pools
UPDATE public.challenges SET prize_pool = 1000, winner_prize = 900 WHERE prize_pool < 1000 OR prize_pool IS NULL;