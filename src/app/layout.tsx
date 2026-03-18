import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ma Vie Parentale \u2014 Tableau de bord familial",
    template: "%s | Ma Vie Parentale",
  },
  description:
    "Centralisez la gestion administrative, \u00e9ducative, fiscale et budg\u00e9taire de votre foyer. Suivi vaccins, budget familial, simulation IR, courbes de croissance.",
  keywords: [
    "gestion famille",
    "suivi vaccin b\u00e9b\u00e9",
    "budget familial",
    "simulateur imp\u00f4t",
    "carnet de sant\u00e9 num\u00e9rique",
    "courbe de croissance",
    "allocations CAF",
  ],
  authors: [{ name: "Ma Vie Parentale" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://mavieparentale.fr",
    siteName: "Ma Vie Parentale",
    title: "Ma Vie Parentale \u2014 Tableau de bord familial",
    description:
      "Centralisez la gestion administrative, \u00e9ducative, fiscale et budg\u00e9taire de votre foyer.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
