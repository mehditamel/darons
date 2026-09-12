import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";

export const metadata: Metadata = { title: "Choisir un nouveau mot de passe", robots: { index: false } };

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/reset-password?error=expired");
  return <UpdatePasswordForm />;
}
