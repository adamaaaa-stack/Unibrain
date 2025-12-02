import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Create a mock client for build time when env vars are not available
let supabase: SupabaseClient;

if (isConfigured) {
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
} else {
  // Log warning during development/build
  if (typeof window !== "undefined") {
    console.warn("Supabase is not configured. Please set up your .env.local file.");
  }
  // Create a placeholder that will be replaced at runtime
  supabase = createBrowserClient(
    "https://placeholder.supabase.co",
    "placeholder-key"
  );
}

export { supabase };
export default supabase;
