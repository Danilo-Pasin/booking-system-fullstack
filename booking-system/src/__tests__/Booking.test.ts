import { describe, it, expect } from "vitest";
import { Booking } from "../domain/entities/Booking";
import { House } from "../domain/entities/House";
import { InvalidDateRangeError, PastCheckInError } from "../domain/errors/DomainError";

function validateBookingDates(checkIn: Date, checkOut: Date): void {
  if (checkOut <= checkIn) {
    throw new InvalidDateRangeError();
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkIn < today) {
    throw new PastCheckInError();
  }
}

function makeHouse(id = "h-001", name = "Test House", price = 200): House {
  return new House(id, name, price);
}

describe("Booking date validation", () => {
  it("accepts valid future dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const checkOut = new Date(future);
    checkOut.setDate(checkOut.getDate() + 3);

    expect(() => validateBookingDates(future, checkOut)).not.toThrow();
  });

  it("rejects check-out before check-in", () => {
    const checkIn = new Date("2026-07-15");
    const checkOut = new Date("2026-07-10");

    expect(() => validateBookingDates(checkIn, checkOut)).toThrow(
      InvalidDateRangeError
    );
  });

  it("rejects check-out equal to check-in", () => {
    const date = new Date("2026-07-15");

    expect(() => validateBookingDates(date, date)).toThrow(
      InvalidDateRangeError
    );
  });

  it("rejects past check-in date", () => {
    const past = new Date("2020-01-01");
    const checkOut = new Date("2020-01-05");

    expect(() => validateBookingDates(past, checkOut)).toThrow(
      PastCheckInError
    );
  });
});

describe("Booking entity", () => {
  it("calculates correct number of days", () => {
    const checkIn = new Date("2026-07-10");
    const checkOut = new Date("2026-07-15");
    const booking = new Booking(makeHouse(), checkIn, checkOut, 1000, "user-1");

    expect(booking.days).toBe(5);
  });

  it("calculates 1 day for same-day checkout", () => {
    const checkIn = new Date("2026-07-10T10:00:00");
    const checkOut = new Date("2026-07-11T09:00:00");
    const booking = new Booking(makeHouse(), checkIn, checkOut, 200, "user-1");

    expect(booking.days).toBe(1);
  });

  it("calculates basePrice from accommodation", () => {
    const house = makeHouse("h-001", "My House", 300);
    const checkIn = new Date("2026-07-10");
    const checkOut = new Date("2026-07-14");
    const booking = new Booking(house, checkIn, checkOut, 9999, "user-1");

    // House.calculatePrice(4) = 300 * 4 + 80 (cleaning fee) = 1280
    expect(booking.basePrice).toBe(1280);
  });

  it("generates a UUID as id", () => {
    const checkIn = new Date("2026-07-10");
    const checkOut = new Date("2026-07-15");
    const booking = new Booking(makeHouse(), checkIn, checkOut, 1000, "user-1");

    expect(booking.id).toBeDefined();
    expect(booking.id.length).toBeGreaterThan(0);
  });

  it("stores userId", () => {
    const checkIn = new Date("2026-07-10");
    const checkOut = new Date("2026-07-15");
    const booking = new Booking(makeHouse(), checkIn, checkOut, 1000, "user-abc");

    expect(booking.userId).toBe("user-abc");
  });

  it("generates createdAt timestamp", () => {
    const before = new Date();
    const checkIn = new Date("2026-07-10");
    const checkOut = new Date("2026-07-15");
    const booking = new Booking(makeHouse(), checkIn, checkOut, 1000, "user-1");
    const after = new Date();

    expect(booking.createdAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime()
    );
    expect(booking.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("summarize returns formatted string", () => {
    const checkIn = new Date("2026-07-10");
    const checkOut = new Date("2026-07-15");
    const booking = new Booking(makeHouse(), checkIn, checkOut, 1000, "user-1");
    const summary = booking.summarize();

    expect(summary).toContain("Reserva #");
    expect(summary).toContain("Test House");
    expect(summary).toContain("R$\u00a01.080,00");
    expect(summary).toContain("R$\u00a01.000,00");
  });
});
