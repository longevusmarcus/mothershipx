import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Production defaults - used when env vars are not set (e.g., Lovable preview)
const PROD_SUPABASE_URL = "https://bbkhiwrgqilaokowhtxg.supabase.co";
const PROD_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJia2hpd3JncWlsYW9rb3dodHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTI2NjEsImV4cCI6MjA4MzQyODY2MX0.hDvryfaIS6Dly9wUHWFGB-6Nic70YBXNHA3as6qY8U4";

// Use env vars if available (for local dev/testing), otherwise fall back to production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || PROD_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || PROD_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
