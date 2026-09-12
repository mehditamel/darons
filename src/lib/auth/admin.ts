import { getAuthenticatedUser } from "@/lib/actions/safe-action";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminContext =
  | { success: true; user: { id: string }; supabase: ReturnType<typeof createAdminClient> }
  | { success: false; error: string };

/** Obtain privileged access only after checking the server-controlled flag. */
export async function getAdminContext(): Promise<AdminContext> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  // This function exists only after the migration has reset legacy flags and
  // revoked self-assignment. An unmigrated database fails closed.
  let authorized = false;
  try {
    const { data, error } = await supabase.rpc("is_current_user_admin");
    authorized = !error && data === true;
  } catch { /* A missing function or unavailable database denies access. */ }
  if (!authorized) return { success: false, error: "Accès refusé" };

  try {
    return { success: true, user, supabase: createAdminClient() };
  } catch {
    return { success: false, error: "L'administration est temporairement indisponible" };
  }
}
