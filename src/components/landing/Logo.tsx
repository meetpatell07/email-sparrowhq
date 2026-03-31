interface LogoProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SparrowMark({ size = 32, color = "currentColor", className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SparrowHQ"
    >
      {/* Main body — sweeping curve of the bird in flight */}
      <path
        d="M7 26 C7 21 11 15 19 15 C24 15 28 16.5 32 11 C32 11 30.5 22 22 24.5 C18.5 25.5 15 24.5 13 27.5 C11 30 11 33 8.5 32.5 C6 32 5.5 29 7 26Z"
        fill={color}
      />
      {/* Upper wing / tail — secondary accent shape */}
      <path
        d="M19 15 C18 10.5 13.5 7 8 7 C11.5 9 15 11.5 19 15Z"
        fill={color}
        opacity="0.55"
      />
      {/* Eye — white dot */}
      <circle cx="26.5" cy="16" r="1.6" fill="white" opacity="0.95" />
    </svg>
  );
}

export function SparrowWordmark({ color = "currentColor", className }: { color?: string; className?: string }) {
  return (
    <span className={className} style={{ color, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.01em" }}>
      SparrowHQ
    </span>
  );
}
