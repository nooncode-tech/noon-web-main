import { describe, it, expect } from "vitest";
import { MAXWELL_PROPOSAL_SYSTEM_PROMPT } from "@/lib/maxwell/prompts";

describe("MAXWELL_PROPOSAL_SYSTEM_PROMPT", () => {
  it("mentions flexible payment as a secondary option", () => {
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("Pago flexible");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("opcion secundaria");
  });

  it("describes the post-payment journey and official workspace states", () => {
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("Post-Payment Journey");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("In Preparation");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("In Development");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("In Review");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("Delivered");
  });

  it("mentions email delivery timing for standard cases", () => {
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("sent by email");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("under 20 minutes");
  });

  it("mentions PM handoff, QA, and deployment in client-facing language", () => {
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("Project Manager");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("QA");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("deployment");
    expect(MAXWELL_PROPOSAL_SYSTEM_PROMPT).toContain("Noon development team");
  });
});
