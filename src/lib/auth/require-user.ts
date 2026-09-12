import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/actions/safe-action";

/** Check the verified session before rendering the private application shell. */
export async function requireAuthenticatedUser() {
  const session = await getAuthenticatedUser();
  if (!session.user) redirect("/login?next=%2Fdashboard");
  return { user: session.user, supabase: session.supabase };
}
