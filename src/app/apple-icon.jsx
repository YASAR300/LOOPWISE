import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F25C1F",
        borderRadius: "44px",
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width="130"
        height="130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 16C7 11.5 10.5 8.5 15 8.5C19.5 8.5 20.5 13 20.5 16C20.5 19 21.5 23.5 26 23.5"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="7.5" cy="16" r="2.5" fill="#1B1A17" />
        <circle cx="25.5" cy="16" r="3" fill="#FFFDF9" />
      </svg>
    </div>,
    {
      ...size,
    }
  );
}
