-- Add slug column for SEO-friendly URLs
ALTER TABLE public.problems 
ADD COLUMN slug TEXT;

-- Create unique index on slug (nullable unique allows multiple NULLs)
CREATE UNIQUE INDEX idx_problems_slug ON public.problems(slug) WHERE slug IS NOT NULL;

-- Create function to generate URL-friendly slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Truncate to reasonable length
  base_slug := left(base_slug, 80);
  
  final_slug := base_slug;
  
  -- Check for duplicates and add suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.problems WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Populate slugs for existing problems
UPDATE public.problems
SET slug = public.generate_slug(title)
WHERE slug IS NULL;

-- Create trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION public.auto_generate_problem_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_generate_problem_slug
BEFORE INSERT ON public.problems
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_problem_slug();