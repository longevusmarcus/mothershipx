-- Update all challenges to $5 entry fee with 10 participants
-- prize_pool = 10 * 5 = 50
-- winner_prize = 50 * 0.9 = 45
UPDATE public.challenges
SET 
  entry_fee = 5,
  participants = 10,
  solo_participants = 7,
  team_count = 1,
  prize_pool = 50,
  winner_prize = 45;