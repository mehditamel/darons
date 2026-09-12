import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export function createClient() {
  const { url: supabaseUrl, key: supabaseAnonKey } = getSupabasePublicConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variables d'environnement Supabase manquantes. Configurez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
