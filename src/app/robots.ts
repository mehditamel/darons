import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://darons.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/admin",
          "/parametres",
          "/onboarding",
          "/sante",
          "/budget",
          "/identite",
          "/fiscal",
          "/documents",
          "/scolarite",
          "/activites",
          "/developpement",
          "/garde",
          "/sante-enrichie",
          "/demarches",
          "/alertes",
          "/partage",
          "/parrainage",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
