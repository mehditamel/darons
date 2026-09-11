import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";
import { safeAuthRedirect } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return <LoginForm nextPath={safeAuthRedirect(searchParams.next)} authError={searchParams.error === "auth"} />;
}
