-- Update all challenges to have consistent $1000 prize pool based on 200 max * $5
UPDATE public.challenges
SET 
  prize_pool = 1000,
  winner_prize = 900,
  max_participants = 200
WHERE status IN ('voting', 'completed');