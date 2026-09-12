import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";
import { safeAuthRedirect } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage(props: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const searchParams = await props.searchParams;
  return <LoginForm nextPath={safeAuthRedirect(searchParams.next)} authError={searchParams.error === "auth"} serviceUnavailable={searchParams.error === "unavailable"} />;
}
