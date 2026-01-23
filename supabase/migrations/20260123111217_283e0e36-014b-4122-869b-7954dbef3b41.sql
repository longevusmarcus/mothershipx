UPDATE challenges 
SET sources = jsonb_set(
  sources::jsonb,
  '{0,metric}',
  '"Views this month"'
)
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';