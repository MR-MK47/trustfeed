import { createClient } from "@supabase/supabase-js";

// Ensure the user provides the Supabase URL in `.env.local`
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "dummy_key_to_pass_build";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
