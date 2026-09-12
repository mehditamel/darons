import { getAuthenticatedUser } from "@/lib/actions/safe-action";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminContext =
  | { success: true; user: { id: string }; supabase: ReturnType<typeof createAdminClient> }
  | { success: false; error: string };

/** Obtain privileged access only after checking the server-controlled flag. */
export async function getAdminContext(): Promise<AdminContext> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase.from("profiles")
    .select("is_admin").eq("id", user.id).single();
  if (error || data?.is_admin !== true) return { success: false, error: "Accès refusé" };

  try {
    return { success: true, user, supabase: createAdminClient() };
  } catch {
    return { success: false, error: "L'administration est temporairement indisponible" };
  }
}
