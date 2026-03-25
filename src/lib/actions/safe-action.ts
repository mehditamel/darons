/**
 * Shared utilities for server actions: error handling, auth, and household resolution.
 */
import { createClient } from "@/lib/supabase/server";

export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type SupabaseClient = ReturnType<typeof createClient>;

export async function safeAction<T>(
  fn: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    console.error("[safeAction]", error);
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

/**
 * Returns the authenticated user and a Supabase client.
 * Never throws — returns { user: null } on any failure.
 */
export async function getAuthenticatedUser(): Promise<{
  user: { id: string; email?: string; email_confirmed_at?: string | null } | null;
  supabase: SupabaseClient;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return { user: null, supabase };
    return { user, supabase };
  } catch (error) {
    console.error("[getAuthenticatedUser]", error);
    // Return a stub client — callers check user === null first anyway
    try {
      const supabase = createClient();
      return { user: null, supabase };
    } catch {
      // createClient itself threw (env vars missing) — return null user
      // Callers must handle user === null and return early
      return { user: null, supabase: null as unknown as SupabaseClient };
    }
  }
}

/**
 * Returns the household ID for a given user.
 * Never throws — returns null on any failure.
 */
export async function getUserHouseholdId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("households")
      .select("id")
      .eq("owner_id", userId)
      .single();
    return data?.id ?? null;
  } catch (error) {
    console.error("[getUserHouseholdId]", error);
    return null;
  }
}
