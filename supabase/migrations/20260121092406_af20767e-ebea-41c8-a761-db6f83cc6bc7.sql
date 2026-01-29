-- Insert admin roles for the 3 specified users (only if they exist in auth.users)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE id IN (
  'e5250c63-6f27-4daa-9c8e-2230670de84e', -- ikivibecollective@gmail.com
  '59c9aa03-9c64-4d3e-8eaa-d1af3322bc5d', -- benmeis@gmail.com
  '1c80c2fe-a85b-439b-9ba1-5ab719a04795'  -- tornikeonoprishvili@gmail.com
)
ON CONFLICT (user_id, role) DO NOTHING;