import { describe, expect, it } from "vitest";
import { GLOBAL_MONTHLY_INITIAL_PROTOTYPES, utcMonthRange } from "@/lib/maxwell/prototype-quota";

describe("utcMonthRange", () => {
  it("returns UTC month boundaries", () => {
    const { startIso, endIso } = utcMonthRange(new Date(Date.UTC(2026, 3, 15, 12, 0, 0)));
    expect(startIso).toBe("2026-04-01T00:00:00.000Z");
    expect(endIso).toBe("2026-05-01T00:00:00.000Z");
  });
});

describe("GLOBAL_MONTHLY_INITIAL_PROTOTYPES", () => {
  it("is 15", () => {
    expect(GLOBAL_MONTHLY_INITIAL_PROTOTYPES).toBe(15);
  });
});
