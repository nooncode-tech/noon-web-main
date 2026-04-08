import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const unsafeMock = vi.fn();

vi.mock("@/lib/server/db", () => ({
  getDb: vi.fn(() => ({
    unsafe: unsafeMock,
  })),
}));

import {
  CONTACT_FORM_MIN_COMPLETION_MS,
  CONTACT_RATE_LIMIT_RETRY_AFTER_SECONDS,
  assessContactSubmission,
  extractContactSecurityMetadata,
  extractRequestIp,
} from "@/lib/server/contact-abuse";

describe("contact-abuse", () => {
  beforeEach(() => {
    unsafeMock.mockReset();
    vi.stubEnv("AUTH_SECRET", "contact-test-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers the first forwarded ip", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 198.51.100.2",
      "x-real-ip": "198.51.100.9",
    });

    expect(extractRequestIp(headers)).toBe("203.0.113.10");
  });

  it("normalizes metadata and hashes the ip", () => {
    const metadata = extractContactSecurityMetadata(
      new Headers({
        "x-real-ip": "198.51.100.9",
        "user-agent": "Mozilla/5.0 Test Browser",
        origin: "https://noon-main.vercel.app/contact",
      })
    );

    expect(metadata.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(metadata.userAgent).toBe("Mozilla/5.0 Test Browser");
    expect(metadata.originHost).toBe("noon-main.vercel.app");
  });

  it("silently ignores honeypot submissions", async () => {
    const result = await assessContactSubmission({
      email: "client@example.com",
      brief: "Need a product portal with billing and onboarding.",
      honeypotValue: "https://spam.example.com",
      headers: new Headers(),
      now: new Date("2026-04-07T12:00:00.000Z"),
    });

    expect(result).toEqual({
      outcome: "accept_ignored",
      reason: "honeypot",
    });
    expect(unsafeMock).not.toHaveBeenCalled();
  });

  it("silently ignores unrealistically fast submissions", async () => {
    const now = new Date("2026-04-07T12:00:00.000Z");
    const result = await assessContactSubmission({
      email: "client@example.com",
      brief: "Need a product portal with billing and onboarding.",
      startedAt: now.getTime() - CONTACT_FORM_MIN_COMPLETION_MS + 100,
      headers: new Headers(),
      now,
    });

    expect(result).toEqual({
      outcome: "accept_ignored",
      reason: "too_fast",
    });
    expect(unsafeMock).not.toHaveBeenCalled();
  });

  it("blocks repeated duplicates from the same email", async () => {
    unsafeMock
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([{ count: 1 }]);

    const result = await assessContactSubmission({
      email: "client@example.com",
      brief: "Need a product portal with billing and onboarding.",
      headers: new Headers({
        "x-real-ip": "198.51.100.9",
      }),
      now: new Date("2026-04-07T12:00:00.000Z"),
    });

    expect(result).toMatchObject({
      outcome: "block",
      reason: "duplicate",
      retryAfterSeconds: CONTACT_RATE_LIMIT_RETRY_AFTER_SECONDS,
    });
    expect(unsafeMock).toHaveBeenCalledTimes(4);
  });

  it("allows legitimate submissions and returns persistence metadata", async () => {
    const now = new Date("2026-04-07T12:00:00.000Z");

    unsafeMock
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ count: 0 }]);

    const result = await assessContactSubmission({
      email: "client@example.com",
      brief: "Need a product portal with billing and onboarding.",
      startedAt: now.getTime() - CONTACT_FORM_MIN_COMPLETION_MS - 1000,
      headers: new Headers({
        "cf-connecting-ip": "203.0.113.12",
        "user-agent": "Mozilla/5.0",
        referer: "https://noon-main.vercel.app/contact?source=about",
      }),
      now,
    });

    expect(result.outcome).toBe("allow");
    if (result.outcome !== "allow") {
      throw new Error("Expected submission to be allowed.");
    }

    expect(result.metadata).toMatchObject({
      userAgent: "Mozilla/5.0",
      originHost: "noon-main.vercel.app",
    });
    expect(result.metadata.ipHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
