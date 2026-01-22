-- Update Reddit-scraped Career problems to use proper Reddit-only source format
UPDATE problems 
SET sources = jsonb_build_array(
  jsonb_build_object('source', 'reddit', 'name', 'reddit', 'trend', views::text || ' upvotes', 'mentions', shares)
)
WHERE id IN (
  '32c5853a-d869-4d4d-b6e4-44b581be670e',
  '76fb9361-02b8-425d-87ab-2251af3e49da',
  '075b71bd-b7dd-4458-855a-53dcced7b435',
  '62f7624e-aeaa-41e0-a68c-425e6f39e4fd',
  '95779491-dc3d-4ec8-9ace-9c4e9808d3fa',
  'a822c961-301b-4ce4-b71e-45a7e829c0c8',
  '66ff2e09-e501-40c2-ba64-28ea70dd4c7e',
  'b87974c3-e6b4-4d1b-80dd-b686bc0b4931',
  '67d15bba-e6e3-45e1-a5cc-afa05a9ff086',
  'd63fc68b-b34a-485c-a5a0-4c05bd30405b',
  '213e18a3-f253-461a-9a4d-d0aeeb7ef2df',
  '201e432b-ae72-4237-a868-1c71fc0bc480'
);