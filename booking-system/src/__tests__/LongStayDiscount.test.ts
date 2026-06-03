import { describe, it, expect } from "vitest";
import { LongStayDiscount } from "../domain/fees/Fee";

describe("LongStayDiscount", () => {
  const discount = new LongStayDiscount();
  const basePrice = 1000;

  it("returns 0 when days is exactly 7", () => {
    const result = discount.calculate(basePrice, 7);
    expect(result).toBe(0);
  });

  it("returns 0 when days is less than 7", () => {
    const result = discount.calculate(basePrice, 3);
    expect(result).toBe(0);
  });

  it("returns 0 when days is 1", () => {
    const result = discount.calculate(basePrice, 1);
    expect(result).toBe(0);
  });

  it("applies 10% discount when days is greater than 7", () => {
    const result = discount.calculate(basePrice, 10);
    expect(result).toBe(-100);
  });

  it("applies correct discount for 14 days", () => {
    const result = discount.calculate(basePrice, 14);
    expect(result).toBe(-100);
  });

  it("applies correct discount for large amounts", () => {
    const result = discount.calculate(5000, 10);
    expect(result).toBe(-500);
  });

  it("returns 0 when days is undefined", () => {
    const result = discount.calculate(basePrice);
    expect(result).toBe(0);
  });
});
