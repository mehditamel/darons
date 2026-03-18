import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ma Vie Parentale — Tableau de bord familial",
    template: "%s | Ma Vie Parentale",
  },
  description:
    "Centralisez la gestion administrative, éducative, fiscale et budgétaire de votre foyer. Suivi vaccins, budget familial, simulation IR, courbes de croissance.",
  keywords: [
    "gestion famille",
    "suivi vaccin bébé",
    "budget familial",
    "simulateur impôt",
    "carnet de santé numérique",
    "courbe de croissance",
    "allocations CAF",
  ],
  authors: [{ name: "Ma Vie Parentale" }],
  manifest: "/manifest.json",
  themeColor: "#1B2838",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cockpit Parental",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://mavieparentale.fr",
    siteName: "Ma Vie Parentale",
    title: "Ma Vie Parentale — Tableau de bord familial",
    description:
      "Centralisez la gestion administrative, éducative, fiscale et budgétaire de votre foyer.",
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
