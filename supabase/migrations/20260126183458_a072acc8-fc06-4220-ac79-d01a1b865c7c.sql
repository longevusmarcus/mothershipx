-- Create storage bucket for idea mockup images
INSERT INTO storage.buckets (id, name, public)
VALUES ('idea-mockups', 'idea-mockups', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Idea mockups are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'idea-mockups');

-- Allow service role to upload
CREATE POLICY "Service role can upload mockups"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'idea-mockups');