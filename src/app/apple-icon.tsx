import { ImageResponse } from "next/og";

import { BRAND_COLOR } from "@/lib/site";

// iOS ignores SVG icons, so render the same mark as a PNG.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // icon.svg uses a 32 unit grid
  const unit = 180 / 32;
  const bar = (left: number, top: number, width: number, height: number) => (
    <div
      style={{
        position: "absolute",
        left: left * unit,
        top: top * unit,
        width: width * unit,
        height: height * unit,
        background: "#fff",
      }}
    />
  );

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: BRAND_COLOR,
        }}
      >
        {bar(8.5, 7.5, 15, 4.5)}
        {bar(13.75, 7.5, 4.5, 17.5)}
      </div>
    ),
    size,
  );
}
