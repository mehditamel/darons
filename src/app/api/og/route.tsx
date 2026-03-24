import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const CATEGORY_COLORS: Record<string, string> = {
  sante: "#2BA89E",
  budget: "#D4A843",
  fiscal: "#D4A843",
  education: "#4A7BE8",
  administratif: "#7B5EA7",
  guide: "#4A7BE8",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Darons";
  const category = searchParams.get("category") || "";

  const accentColor = CATEGORY_COLORS[category] || "#E8734A";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FDFAF6",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {category && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: accentColor,
                }}
              />
              <span
                style={{
                  fontSize: "24px",
                  color: accentColor,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {category}
              </span>
            </div>
          )}
          <h1
            style={{
              fontSize: title.length > 60 ? "42px" : "52px",
              fontWeight: 700,
              color: "#1B2838",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#E8734A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              D
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#1B2838",
              }}
            >
              Darons
            </span>
          </div>
          <span
            style={{
              fontSize: "20px",
              color: "#6B7280",
            }}
          >
            darons.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
