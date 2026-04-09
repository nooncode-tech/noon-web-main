interface NoonLogoProps {
  variant?: "wordmark" | "icon";
  className?: string;
}

export function NoonLogo({ variant = "wordmark", className = "" }: NoonLogoProps) {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="none"
        aria-label="Noon"
      >
        {/* Back square */}
        <rect x="3" y="3" width="62" height="62" rx="13" fill="currentColor" />
        {/* Front square — background fill to create the cutout effect */}
        <rect x="35" y="35" width="62" height="62" rx="13" style={{ fill: "var(--background)" }} />
        {/* Front square — border */}
        <rect x="35" y="35" width="62" height="62" rx="13" stroke="currentColor" strokeWidth="8" />
        {/* Cursor — vertical bar */}
        <rect x="63" y="44" width="8" height="26" rx="1" fill="currentColor" />
        {/* Cursor — base */}
        <rect x="59" y="65" width="16" height="9" rx="2" fill="currentColor" />
      </svg>
    );
  }

  // Wordmark: n + [oo double-square] + n
  return (
    <svg
      viewBox="0 0 360 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      aria-label="Noon"
    >
      {/* First "n" — left leg, right leg, top arch */}
      <rect x="0" y="0" width="26" height="100" rx="10" fill="currentColor" />
      <rect x="70" y="0" width="26" height="100" rx="10" fill="currentColor" />
      <rect x="0" y="0" width="96" height="42" rx="14" fill="currentColor" />

      {/* "oo" double-square mark */}
      {/* Back square */}
      <rect x="108" y="2" width="96" height="96" rx="18" fill="currentColor" />
      {/* Front square — bg fill for cutout */}
      <rect x="156" y="2" width="96" height="96" rx="18" style={{ fill: "var(--background)" }} />
      {/* Front square — border */}
      <rect x="156" y="2" width="96" height="96" rx="18" stroke="currentColor" strokeWidth="10" />
      {/* Cursor — vertical bar */}
      <rect x="196" y="28" width="10" height="32" rx="1.5" fill="currentColor" />
      {/* Cursor — base foot */}
      <rect x="190" y="54" width="22" height="13" rx="2.5" fill="currentColor" />

      {/* Second "n" — left leg, right leg, top arch */}
      <rect x="264" y="0" width="26" height="100" rx="10" fill="currentColor" />
      <rect x="334" y="0" width="26" height="100" rx="10" fill="currentColor" />
      <rect x="264" y="0" width="96" height="42" rx="14" fill="currentColor" />
    </svg>
  );
}
