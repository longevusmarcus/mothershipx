import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Lovable preview does not reliably inject VITE_* env vars.
// Use the project constants directly (anon key is safe to ship to the client).
const SUPABASE_URL = "https://bbkhiwrgqilaokowhtxg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJia2hpd3JncWlsYW9rb3dodHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTI2NjEsImV4cCI6MjA4MzQyODY2MX0.hDvryfaIS6Dly9wUHWFGB-6Nic70YBXNHA3as6qY8U4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
