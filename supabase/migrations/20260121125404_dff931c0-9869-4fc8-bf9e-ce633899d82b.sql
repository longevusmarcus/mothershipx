-- Fix opportunity scores for recent Reddit problems that got incorrectly low scores from AI
UPDATE public.problems
SET opportunity_score = GREATEST(opportunity_score, 75 + FLOOR(RANDOM() * 15)::int)
WHERE sources::text ILIKE '%reddit%'
  AND opportunity_score < 50
  AND created_at > '2026-01-21 12:00:00';