-- Store challenge joins per user
CREATE TABLE public.challenge_joins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  join_type public.join_type NOT NULL DEFAULT 'solo',
  team_name TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

ALTER TABLE public.challenge_joins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge joins"
ON public.challenge_joins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenge joins"
ON public.challenge_joins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenge joins"
ON public.challenge_joins
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_challenge_joins_updated_at
BEFORE UPDATE ON public.challenge_joins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Keep challenge counters in sync when users join/leave
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
    prize_pool = (participants + 1) * entry_fee,
    winner_prize = FLOOR(((participants + 1) * entry_fee) * 0.9),
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
    prize_pool = GREATEST(0, (participants - 1)) * entry_fee,
    winner_prize = FLOOR((GREATEST(0, (participants - 1)) * entry_fee) * 0.9),
    updated_at = now()
  WHERE id = OLD.challenge_id;

  RETURN OLD;
END;
$$;

CREATE TRIGGER challenge_join_insert
AFTER INSERT ON public.challenge_joins
FOR EACH ROW
EXECUTE FUNCTION public.on_challenge_join_insert();

CREATE TRIGGER challenge_join_delete
AFTER DELETE ON public.challenge_joins
FOR EACH ROW
EXECUTE FUNCTION public.on_challenge_join_delete();

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_challenge_joins_user_id ON public.challenge_joins(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_joins_challenge_id ON public.challenge_joins(challenge_id);