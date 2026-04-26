import { describe, expect, it } from "vitest";
import { noonAppProposalReviewDecisionPayloadSchema } from "@/lib/noon-app-integration";

const basePayload = {
  event: "proposal_review_decision",
  external_source: "noon_website",
  external_session_id: "session-1",
  external_proposal_id: "proposal-1",
  proposal: {
    title: "Website project",
    body: "Approved proposal body",
    amount: 4500,
    currency: "USD",
    review_status: "approved",
  },
};

describe("Noon App review decision payload", () => {
  it.each(["approved", "changes_requested", "rejected", "cancelled"])(
    "accepts the %s decision",
    (decision) => {
      const parsed = noonAppProposalReviewDecisionPayloadSchema.parse({
        ...basePayload,
        decision,
      });

      expect(parsed.decision).toBe(decision);
    },
  );

  it("rejects the old approval-only event contract", () => {
    expect(() =>
      noonAppProposalReviewDecisionPayloadSchema.parse({
        ...basePayload,
        event: "proposal_approved",
        decision: "approved",
      }),
    ).toThrow();
  });
});
