-- Add payment_info column for winner payouts
ALTER TABLE public.submissions 
ADD COLUMN payment_info text;