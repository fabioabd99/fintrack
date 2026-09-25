import { ImageResponse } from "next/og";

import { BRAND_COLOR, SITE_NAME } from "@/lib/site";

// Social preview image (sample numbers).
export const alt =
  "Tillpay: you can spend €6,914.95, €223.06 a day until you are paid on 25 October";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f5f5f7",
          color: "#111827",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: BRAND_COLOR,
              display: "flex",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", left: 20, top: 15, width: 9, height: 35, background: "#fff" }} />
            <div style={{ position: "absolute", left: 20, top: 15, width: 25, height: 9, background: "#fff" }} />
            <div style={{ position: "absolute", left: 20, top: 31, width: 22, height: 8.5, background: "#fff" }} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 56,
            borderRadius: 40,
            background: "#ffffff",
            boxShadow: "0 20px 60px -30px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontSize: 34, color: "#6b7280" }}>You can spend</div>
          <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -4 }}>
            €6,914.95
          </div>
          <div style={{ fontSize: 34, color: "#374151" }}>
            €223.06 a day until you are paid on 25 October
          </div>
        </div>

        <div style={{ fontSize: 32, color: "#374151" }}>
          Know what you can spend until payday.
        </div>
      </div>
    ),
    size,
  );
}
