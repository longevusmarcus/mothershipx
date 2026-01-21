-- Update cron job to run daily at 3 AM UTC instead of every 3 days
SELECT cron.unschedule('refresh-problem-data-every-3-days');

SELECT cron.schedule(
  'refresh-problem-data-daily',
  '0 3 * * *',  -- Every day at 3:00 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://bbkhiwrgqilaokowhtxg.supabase.co/functions/v1/refresh-problem-data',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{"updateAll": true}'::jsonb
    ) AS request_id;
  $$
);