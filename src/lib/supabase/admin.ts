import "server-only";
import { createClient } from "@supabase/supabase-js";

export function getSupabaseSecretKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * Supabase admin client using service_role key.
 * USE ONLY in server-side API routes (webhooks, cron jobs).
 * NEVER import this from client components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = getSupabaseSecretKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuration serveur Supabase manquante"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
