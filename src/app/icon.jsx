import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        background: "#08090A",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#5E6AD2",
        borderRadius: "6px",
        border: "1px solid rgba(94, 106, 210, 0.4)",
        letterSpacing: "-0.04em",
      }}
    >
      LW
    </div>,
    {
      ...size,
    }
  );
}
