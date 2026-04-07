function normalizeBaseUrl(candidate: string | null | undefined): string | null {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }

  return `https://${trimmed.replace(/\/+$/, "")}`;
}

export function resolvePublicBaseUrl(request?: Request): string | null {
  const envCandidate =
    normalizeBaseUrl(process.env.MAXWELL_PUBLIC_BASE_URL) ??
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeBaseUrl(process.env.VERCEL_URL);

  if (envCandidate) {
    return envCandidate;
  }

  if (!request) {
    return null;
  }

  return new URL(request.url).origin;
}

export function buildPublicProposalUrl(publicToken: string, request?: Request): string {
  const baseUrl = resolvePublicBaseUrl(request);
  if (!baseUrl) {
    throw new Error(
      "A public base URL is required. Set MAXWELL_PUBLIC_BASE_URL or NEXT_PUBLIC_SITE_URL."
    );
  }

  return new URL(`/maxwell/proposal/${publicToken}`, baseUrl).toString();
}
