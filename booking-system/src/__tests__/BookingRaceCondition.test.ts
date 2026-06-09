import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { Booking } from "../domain/entities/Booking";
import { House } from "../domain/entities/House";
import { BookingNotPendingError } from "../domain/errors/DomainError";

describe("BookingRepository — expectedStatus race condition", () => {
  let repo: InMemoryBookingRepository;
  let booking: Booking;

  beforeEach(async () => {
    repo = new InMemoryBookingRepository();
    const house = new House("acc-1", "Test House", 200);
    booking = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, "user-1");
    await repo.save(booking);
  });

  it("updateStatus succeeds when expectedStatus matches current status", async () => {
    const result = await repo.updateStatus(booking.id, "APPROVED", "PENDING");
    expect(result.status).toBe("APPROVED");
  });

  it("updateStatus throws BookingNotPendingError when expectedStatus does not match", async () => {
    await expect(
      repo.updateStatus(booking.id, "APPROVED", "REJECTED" as any),
    ).rejects.toThrow(BookingNotPendingError);
  });

  it("updateStatus succeeds without expectedStatus (no optimistic check)", async () => {
    const result = await repo.updateStatus(booking.id, "CANCELED");
    expect(result.status).toBe("CANCELED");
  });

  it("updateStatus with expectedStatus prevents overwriting an already-approved booking", async () => {
    await repo.updateStatus(booking.id, "APPROVED");

    await expect(
      repo.updateStatus(booking.id, "REJECTED", "PENDING"),
    ).rejects.toThrow(BookingNotPendingError);
  });

  it("two concurrent updates: only the first with correct expectedStatus succeeds", async () => {
    const first = repo.updateStatus(booking.id, "APPROVED", "PENDING");
    const second = repo.updateStatus(booking.id, "REJECTED", "PENDING");

    await expect(first).resolves.toBeDefined();
    await expect(second).rejects.toThrow(BookingNotPendingError);
  });
});
