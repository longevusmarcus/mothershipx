-- Update existing problems with varied metrics based on a hash of their title
-- This applies a 0.6x to 1.8x variation factor to prevent identical metrics

UPDATE public.problems
SET 
  views = ROUND(views * (0.6 + (MOD(ABS(HASHTEXT(title)), 1000)::numeric / 1000.0) * 1.2)),
  saves = ROUND(saves * (0.6 + (MOD(ABS(HASHTEXT(title || 'saves')), 1000)::numeric / 1000.0) * 1.2)),
  shares = ROUND(shares * (0.6 + (MOD(ABS(HASHTEXT(title || 'shares')), 1000)::numeric / 1000.0) * 1.2))
WHERE views IS NOT NULL;