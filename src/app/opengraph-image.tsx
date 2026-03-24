import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Darons — Toute ta vie de daron. Une seule app.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FDFAF6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              backgroundColor: "#E8734A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "36px",
              fontWeight: "bold",
            }}
          >
            D
          </div>
          <span style={{ fontSize: "48px", fontWeight: "bold", color: "#1B2838" }}>
            Darons
          </span>
        </div>
        <p
          style={{
            fontSize: "32px",
            fontWeight: "600",
            color: "#1B2838",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.3",
          }}
        >
          Toute ta vie de daron. Une seule app.
        </p>
        <p
          style={{
            fontSize: "20px",
            color: "#6B7280",
            textAlign: "center",
            maxWidth: "700px",
            marginTop: "16px",
          }}
        >
          Santé, budget, impôts, papiers — 100% gratuit
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["Santé", "Budget", "Fiscal", "Éducation", "Garde", "Démarches"].map(
            (label) => (
              <span
                key={label}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backgroundColor: "#E8734A20",
                  color: "#E8734A",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
