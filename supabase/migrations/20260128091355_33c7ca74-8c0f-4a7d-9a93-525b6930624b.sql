-- Update existing problems to have max 10 slots instead of 20
UPDATE public.problems 
SET slots_total = 10 
WHERE slots_total > 10;

-- Also update slots_filled if it exceeds new max (edge case)
UPDATE public.problems 
SET slots_filled = 10 
WHERE slots_filled > 10;

-- Update the default value for new problems
ALTER TABLE public.problems 
ALTER COLUMN slots_total SET DEFAULT 10;