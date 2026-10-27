import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tools Stars — Free Online Tools That Run in Your Browser";

export default function OgImage() {
  const tools = ["Video Compressor", "AI Background Remover", "Image Compressor", "Image to PDF", "QR Generator"];
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
          background: "linear-gradient(135deg, #05060f 0%, #12102e 55%, #1b1033 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 60,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 110,
              height: 110,
              borderRadius: 28,
              background: "linear-gradient(135deg, #fcd34d, #f59e0b, #ea580c)",
              fontSize: 64,
              color: "#241a00",
            }}
          >
            <svg width="62" height="62" viewBox="0 0 24 24">
              <path
                d="M12 2.5l2.95 6.36 6.95.8-5.13 4.73 1.36 6.86L12 17.9l-6.13 3.35 1.36-6.86L2.1 9.66l6.95-.8L12 2.5z"
                fill="#241a00"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 900, letterSpacing: -2 }}>
            <span>Tools</span>
            <span style={{ color: "#ffc531" }}>Stars</span>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 28, fontSize: 36, color: "#c7cbe8", textAlign: "center" }}>
          Free online tools that run in your browser
        </div>
        <div style={{ display: "flex", marginTop: 10, fontSize: 24, color: "#8b90b8" }}>
          No sign-up · No uploads · No watermarks
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 44, justifyContent: "center" }}>
          {tools.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 999,
                border: "2px solid rgba(255,197,49,0.45)",
                background: "rgba(255,197,49,0.10)",
                color: "#ffd968",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
