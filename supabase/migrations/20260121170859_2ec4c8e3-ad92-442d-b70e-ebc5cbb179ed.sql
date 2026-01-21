-- Normalize all social/connections variations to a single "Connections" category
UPDATE public.problems 
SET category = 'Connections', niche = 'connections'
WHERE LOWER(category) IN ('social connections', 'social', 'connections') 
   OR LOWER(niche) IN ('social connections', 'social', 'connections');

-- Also merge entrepreneurship into business
UPDATE public.problems
SET category = 'Business', niche = 'business'
WHERE LOWER(category) IN ('entrepreneurship') 
   OR LOWER(niche) IN ('entrepreneurship');