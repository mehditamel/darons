import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return <LoginForm />;
}
