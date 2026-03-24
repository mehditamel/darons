import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://darons.app";

const TOOL_PAGES = [
  "simulateur-ir",
  "simulateur-caf",
  "simulateur-garde",
  "simulateur-budget",
  "calendrier-vaccinal",
  "courbe-croissance",
  "mes-droits",
  "checklist-naissance",
  "numeros-urgence",
  "conge-parental",
  "combien-coute-enfant",
  "ecrans-enfants",
  "examens-sante",
  "jalons-developpement",
  "timeline-administrative",
  "guide-demarches-naissance",
  "guide-vaccins-obligatoires",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  const blogEntries = articles.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const toolEntries = TOOL_PAGES.map((slug) => ({
    url: `${BASE_URL}/outils/${slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogEntries,
    {
      url: `${BASE_URL}/outils`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...toolEntries,
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/reset-password`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cgu`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/politique-confidentialite`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
