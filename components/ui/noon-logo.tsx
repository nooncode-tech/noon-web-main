interface NoonLogoProps {
  variant?: "wordmark" | "icon" | "lockup";
  className?: string;
  height?: number;
}

function LogoIcon({ height, className }: { height: number; className?: string }) {
  return (
    <img src="/logo-icon.png" alt="" height={height} width={height} className={className} />
  );
}

function LogoWordmark({ height, className }: { height: number; className?: string }) {
  const width = Math.round(height * (6163 / 1441));
  return (
    <picture>
      <source srcSet="/logo-wordmark-dark.png" media="(prefers-color-scheme: dark)" />
      <img src="/logo-wordmark.png" alt="Noon" height={height} width={width} className={className} />
    </picture>
  );
}

export function NoonLogo({ variant = "lockup", className = "", height = 32 }: NoonLogoProps) {
  if (variant === "icon") {
    return <LogoIcon height={height} className={className} />;
  }

  if (variant === "wordmark") {
    return <LogoWordmark height={height} className={className} />;
  }

  // lockup: icon + wordmark side by side
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoIcon height={height} />
      <LogoWordmark height={height} />
    </span>
  );
}
