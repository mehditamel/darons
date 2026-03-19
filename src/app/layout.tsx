import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { PlausibleProvider } from "@/components/analytics/plausible-provider";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1B2838",
};

export const metadata: Metadata = {
  title: {
    default: "Darons — Toute ta vie de daron. Une seule app.",
    template: "%s | Darons",
  },
  description:
    "L'app gratuite qui centralise toute la vie de famille : santé des enfants, budget du foyer, fiscalité, éducation — le tout avec une couche IA qui anticipe et simplifie.",
  keywords: [
    "gestion famille",
    "suivi vaccin bébé",
    "budget familial",
    "simulateur impôt",
    "carnet de santé numérique",
    "courbe de croissance",
    "allocations CAF",
    "app parents",
    "darons",
  ],
  authors: [{ name: "Darons" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Darons",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://darons.app",
    siteName: "Darons",
    title: "Darons — Toute ta vie de daron. Une seule app.",
    description:
      "L'app gratuite qui centralise toute la vie de famille : santé, budget, impôts, papiers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <PlausibleProvider />
      </body>
    </html>
  );
}
