import { describe, it, expect } from "vitest";
import { calcDays } from "../domain/utils/date";

describe("calcDays", () => {
  it("returns 1 day for overnight stay", () => {
    const result = calcDays(new Date("2025-06-01"), new Date("2025-06-02"));
    expect(result).toBe(1);
  });

  it("returns 4 days for June 1 to June 5", () => {
    const result = calcDays(new Date("2025-06-01"), new Date("2025-06-05"));
    expect(result).toBe(4);
  });

  it("throws for same day (invalid range)", () => {
    expect(() => calcDays(new Date("2025-06-01"), new Date("2025-06-01"))).toThrow("O check-out deve ser posterior ao check-in.");
  });

  it("throws for check-out before check-in", () => {
    expect(() => calcDays(new Date("2025-06-05"), new Date("2025-06-01"))).toThrow("O check-out deve ser posterior ao check-in.");
  });

  it("returns 7 days for week-long stay", () => {
    const result = calcDays(new Date("2025-06-01"), new Date("2025-06-08"));
    expect(result).toBe(7);
  });
});
