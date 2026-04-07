import { describe, expect, it } from "vitest";
import { stripInternalReviewFlags } from "@/lib/maxwell/proposal-content";

describe("stripInternalReviewFlags", () => {
  it("returns an empty string for nullish drafts", () => {
    expect(stripInternalReviewFlags(null)).toBe("");
    expect(stripInternalReviewFlags(undefined)).toBe("");
  });

  it("removes the internal PM review block from the client-facing draft", () => {
    const draft = `Proposal body

---

_PM Review Flags (internal only):_
- Warning one
- Warning two`;

    expect(stripInternalReviewFlags(draft)).toBe("Proposal body");
  });

  it("leaves regular drafts untouched", () => {
    expect(stripInternalReviewFlags("Proposal body")).toBe("Proposal body");
  });
});
