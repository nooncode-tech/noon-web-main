import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ProposalEmailConfigurationError,
  sendProposalEmail,
  isProposalEmailConfigured,
} from "@/lib/maxwell/proposal-email";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("isProposalEmailConfigured", () => {
  it("returns false when required env vars are missing", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("MAIL_FROM", "");
    expect(isProposalEmailConfigured()).toBe(false);
  });

  it("returns true when Resend config is complete", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("MAIL_FROM", "Noon <hello@noon.com>");
    expect(isProposalEmailConfigured()).toBe(true);
  });
});

describe("sendProposalEmail", () => {
  it("throws a configuration error without provider config", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("MAIL_FROM", "");

    await expect(
      sendProposalEmail({
        proposalId: "proposal-1",
        versionNumber: 1,
        to: "client@example.com",
        publicUrl: "https://noon.com/maxwell/proposal/token-1",
        projectTitle: "Client portal",
      })
    ).rejects.toBeInstanceOf(ProposalEmailConfigurationError);
  });

  it("sends the message through Resend and returns the provider id", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("MAIL_FROM", "Noon <hello@noon.com>");
    vi.stubEnv("MAIL_REPLY_TO", "support@noon.com");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "email_123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendProposalEmail({
      proposalId: "proposal-1",
      versionNumber: 3,
      to: "client@example.com",
      publicUrl: "https://noon.com/maxwell/proposal/token-1",
      projectTitle: "Client portal",
    });

    expect(result).toEqual({ provider: "resend", messageId: "email_123" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");

    const payload = JSON.parse(String(init.body)) as {
      to: string[];
      subject: string;
      html: string;
      text: string;
    };

    expect(payload.to).toEqual(["client@example.com"]);
    expect(payload.subject).toContain("Client portal");
    expect(payload.html).toContain("Open proposal");
    expect(payload.text).toContain("15 days");
  });
});
