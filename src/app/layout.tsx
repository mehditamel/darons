import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { PlausibleProvider } from "@/components/analytics/plausible-provider";
import { WebVitalsReporter } from "@/components/analytics/web-vitals";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import "./family-design.css";
import "./family-value.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFAF6" },
    { media: "(prefers-color-scheme: dark)", color: "#1B2838" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://darons.app"),
  title: {
    default: "Darons — Toute ta vie de daron. Une seule app.",
    template: "%s | Darons",
  },
  description:
    "Organise la vie de famille avec Darons : santé des enfants, budget du foyer, fiscalité et documents. Découvre les outils gratuits et les offres disponibles.",
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
    statusBarStyle: "black-translucent",
    title: "Darons",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://darons.app",
    siteName: "Darons",
    title: "Darons — Toute ta vie de daron. Une seule app.",
    description:
      "Santé, budget, impôts, papiers : des outils pour organiser le quotidien de ta famille.",
    images: [
      {
        url: "https://darons.app/api/og?title=Toute%20ta%20vie%20de%20daron.%20Une%20seule%20app.",
        width: 1200,
        height: 630,
        alt: "Darons — Toute ta vie de daron. Une seule app.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Darons — Toute ta vie de daron. Une seule app.",
    description:
      "Santé, budget, impôts, papiers : des outils pour organiser le quotidien de ta famille.",
    images: [
      "https://darons.app/api/og?title=Toute%20ta%20vie%20de%20daron.%20Une%20seule%20app.",
    ],
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
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="72x72"
          href="/icons/icon-72x72.png"
        />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Blog Darons"
          href="/rss.xml"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <PlausibleProvider />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
