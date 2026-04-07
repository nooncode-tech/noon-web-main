import { describe, expect, it } from "vitest";
import {
  extractInternalReviewFlags,
  parseProposalBlocks,
  stripInternalReviewFlags,
} from "@/lib/maxwell/proposal-content";

const PROPOSAL_WITH_FLAGS = `### Project Proposal - RPM Calculator

**Executive Summary**
This project delivers a browser-based RPM calculator.

**Scope & Deliverables**
1. **Main Calculator**
- Display current stack values
- Allow variable reuse

---

_PM Review Flags (internal only):_
- [REVIEW FLAG] Falta la opcion secundaria visible de Pago flexible.
- [REVIEW FLAG] Falta la opcion principal de Membresia en la propuesta.
`;

describe("proposal-content", () => {
  it("strips internal review flags from proposal content", () => {
    expect(stripInternalReviewFlags(PROPOSAL_WITH_FLAGS)).not.toContain("_PM Review Flags");
    expect(stripInternalReviewFlags(PROPOSAL_WITH_FLAGS)).not.toContain("[REVIEW FLAG]");
  });

  it("extracts internal review flags as separate items", () => {
    expect(extractInternalReviewFlags(PROPOSAL_WITH_FLAGS)).toEqual([
      "[REVIEW FLAG] Falta la opcion secundaria visible de Pago flexible.",
      "[REVIEW FLAG] Falta la opcion principal de Membresia en la propuesta.",
    ]);
  });

  it("parses proposal content into renderable blocks", () => {
    const blocks = parseProposalBlocks(PROPOSAL_WITH_FLAGS);
    expect(blocks).toEqual([
      { type: "heading", level: 3, text: "Project Proposal - RPM Calculator" },
      { type: "heading", level: 3, text: "Executive Summary" },
      { type: "paragraph", text: "This project delivers a browser-based RPM calculator." },
      { type: "heading", level: 3, text: "Scope & Deliverables" },
      { type: "ordered_list", items: ["**Main Calculator**"] },
      { type: "unordered_list", items: ["Display current stack values", "Allow variable reuse"] },
    ]);
  });
});
