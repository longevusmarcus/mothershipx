-- Schedule weekly idea generation (every Sunday at 4 AM UTC)
SELECT cron.schedule(
  'generate-weekly-ideas',
  '0 4 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://bbkhiwrgqilaokowhtxg.supabase.co/functions/v1/generate-all-ideas',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJia2hpd3JncWlsYW9rb3dodHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTI2NjEsImV4cCI6MjA4MzQyODY2MX0.hDvryfaIS6Dly9wUHWFGB-6Nic70YBXNHA3as6qY8U4"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);