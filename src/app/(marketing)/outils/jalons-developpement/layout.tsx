import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jalons de développement enfant — Motricité, langage, cognition",
  description:
    "Premiers mots, premiers pas : suis les jalons de développement de ton enfant selon les référentiels OMS et HAS. Motricité, langage, cognition, autonomie.",
  openGraph: {
    title: "Jalons de développement enfant — Darons",
    description: "Où en est ton enfant ? Les jalons OMS/HAS par âge.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
