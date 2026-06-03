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

  it("returns 0 days for same day", () => {
    const result = calcDays(new Date("2025-06-01"), new Date("2025-06-01"));
    expect(result).toBe(0);
  });

  it("returns 7 days for week-long stay", () => {
    const result = calcDays(new Date("2025-06-01"), new Date("2025-06-08"));
    expect(result).toBe(7);
  });
});
