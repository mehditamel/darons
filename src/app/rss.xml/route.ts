import { getAllArticles } from "@/lib/blog-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://darons.app";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = getAllArticles();

  const items = articles
    .map(
      (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${BASE_URL}/blog/${article.slug}</link>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/blog/${article.slug}</guid>
      <category>${escapeXml(article.category)}</category>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Darons</title>
    <link>${BASE_URL}/blog</link>
    <description>Guides pratiques pour les parents : santé, fiscal, budget, garde, démarches.</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
