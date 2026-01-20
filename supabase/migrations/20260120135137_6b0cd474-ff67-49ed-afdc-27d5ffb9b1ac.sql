-- Update the default value of entry_fee from 2 to 5
ALTER TABLE public.challenges ALTER COLUMN entry_fee SET DEFAULT 5;