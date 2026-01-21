-- Update existing Reddit problems to have proper source format with 'source' key
UPDATE public.problems
SET sources = jsonb_build_array(
  jsonb_build_object(
    'source', 'reddit',
    'name', 'reddit',
    'sentiment', sentiment,
    'mentions', COALESCE(shares, 0),
    'trend', CONCAT(views::text, ' upvotes')
  )
)
WHERE sources::text ILIKE '%"name":"reddit"%'
  AND NOT (sources::text ILIKE '%"source":"reddit"%');