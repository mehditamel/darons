import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenue | Darons",
  description: "Configure ton foyer en quelques étapes. C'est rapide, promis.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
