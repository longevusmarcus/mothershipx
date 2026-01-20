-- Add max_participants column to challenges
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS max_participants integer NOT NULL DEFAULT 200;

-- Update active challenge with correct prize pool based on max (200 * $5 = $1000)
UPDATE public.challenges
SET 
  max_participants = 200,
  prize_pool = 1000,
  winner_prize = 900
WHERE status = 'active';