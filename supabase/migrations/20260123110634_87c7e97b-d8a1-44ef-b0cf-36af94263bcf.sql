-- Add variation to existing problems that have identical metrics
-- This fixes the "Social & Relationships" cards that all show the same 4.3M views

UPDATE problems 
SET 
  views = ROUND(views * (0.6 + random() * 0.8)),
  saves = ROUND(saves * (0.5 + random() * 1.0)),
  shares = ROUND(shares * (0.6 + random() * 0.8))
WHERE views = 4311238 AND saves = 83983 AND shares = 16216;