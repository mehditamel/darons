import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline administrative — De la grossesse à l'école",
  description:
    "La frise chronologique de toutes les démarches de parent : grossesse, naissance, santé, CAF, scolarité. Visualise tout ce que tu dois faire et quand.",
  openGraph: {
    title: "Timeline administrative — Darons",
    description: "De la grossesse à l'école : tout ce que tu dois faire, quand.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
