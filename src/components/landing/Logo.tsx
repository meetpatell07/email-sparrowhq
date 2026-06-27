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
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EmailHQ"
    >
      {/* Gray wing / feather accent — upper left */}
      <path
        d="M 10,44 C 16,26 34,10 50,3 C 53,2 56,5 54,8 C 38,14 20,30 12,46 Z"
        fill={color}
        opacity="0.45"
      />
      {/* Main bird body — rounded belly with beak sweeping upper-right */}
      <path
        d="M 93,16
           C 85,7 70,13 60,24
           C 50,34 58,48 50,60
           C 42,72 22,74 12,82
           C 4,89 8,98 24,98
           C 44,98 64,90 72,78
           C 78,68 76,56 78,44
           C 80,32 88,22 93,16 Z"
        fill={color}
      />
      {/* Eye — white dot */}
      <circle cx="70" cy="30" r="4" fill="white" opacity="0.95" />
    </svg>
  );
}

export function SparrowWordmark({ color = "currentColor", className }: { color?: string; className?: string }) {
  return (
    <span className={className} style={{ color, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.01em" }}>
      EmailHQ
    </span>
  );
}
