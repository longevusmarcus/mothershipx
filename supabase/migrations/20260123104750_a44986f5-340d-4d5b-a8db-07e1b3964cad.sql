UPDATE challenges 
SET sources = '[{"source": "tiktok", "metric": "Views this week", "value": "500k"}, {"source": "google_trends", "metric": "Search growth", "value": "+340%"}]'::jsonb
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';