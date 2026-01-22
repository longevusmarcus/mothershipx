-- Update all problems to have max 20 builder capacity
UPDATE public.problems 
SET slots_total = 20 
WHERE slots_total > 20;

-- Also update the default value for new problems
ALTER TABLE public.problems 
ALTER COLUMN slots_total SET DEFAULT 20;