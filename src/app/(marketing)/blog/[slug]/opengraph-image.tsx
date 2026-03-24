import { ImageResponse } from "next/og";
import { getArticleBySlug, getAllArticles } from "@/lib/blog-data";

export const runtime = "edge";
export const alt = "Article Darons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

const CATEGORY_COLORS: Record<string, string> = {
  "Santé": "#2BA89E",
  "Fiscal": "#D4A843",
  "Garde": "#E8734A",
  "Budget": "#4A7BE8",
  "Démarches": "#7B5EA7",
  "Identité": "#4CAF50",
  "Développement": "#7B5EA7",
};

export default function OgImage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  const title = article?.title ?? "Article Darons";
  const category = article?.category ?? "Blog";
  const categoryColor = CATEGORY_COLORS[category] ?? "#E8734A";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#FDFAF6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: "6px 16px",
              borderRadius: "20px",
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {category}
          </span>
          <h1
            style={{
              fontSize: "44px",
              fontWeight: "bold",
              color: "#1B2838",
              lineHeight: "1.2",
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#E8734A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            D
          </div>
          <span style={{ fontSize: "20px", fontWeight: "600", color: "#1B2838" }}>
            Darons
          </span>
          <span style={{ fontSize: "16px", color: "#6B7280", marginLeft: "8px" }}>
            darons.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
