import { describe, expect, it, vi, afterEach } from "vitest";
import { buildPublicProposalUrl, resolvePublicBaseUrl } from "@/lib/maxwell/public-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolvePublicBaseUrl", () => {
  it("prefers MAXWELL_PUBLIC_BASE_URL when configured", () => {
    vi.stubEnv("MAXWELL_PUBLIC_BASE_URL", "https://noon.com/");
    expect(resolvePublicBaseUrl()).toBe("https://noon.com");
  });

  it("falls back to request origin", () => {
    const request = new Request("https://preview.noon.com/api/maxwell/review-sla");
    expect(resolvePublicBaseUrl(request)).toBe("https://preview.noon.com");
  });
});

describe("buildPublicProposalUrl", () => {
  it("builds a full proposal URL from configured env", () => {
    vi.stubEnv("MAXWELL_PUBLIC_BASE_URL", "https://noon.com");
    expect(buildPublicProposalUrl("token-123")).toBe("https://noon.com/maxwell/proposal/token-123");
  });

  it("builds from request origin when no env is configured", () => {
    const request = new Request("https://preview.noon.com/api/maxwell/review");
    expect(buildPublicProposalUrl("token-123", request)).toBe(
      "https://preview.noon.com/maxwell/proposal/token-123"
    );
  });
});
