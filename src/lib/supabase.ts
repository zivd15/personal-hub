import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://lovybxjvzuyduimloioz.supabase.co";

const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_OP5Jg6lYCT_c0_QdN_h3TQ_xYf7RpzI";

export const isConfigured = true;
export const supabase = createClient(url, key);
