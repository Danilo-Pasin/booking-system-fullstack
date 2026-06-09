import { describe, it, expect, beforeEach } from "vitest";
import { CancelBooking } from "../application/use-cases/CancelBooking";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { Booking } from "../domain/entities/Booking";
import { House } from "../domain/entities/House";
import { BookingNotFoundError, ForbiddenError, ValidationError } from "../domain/errors/DomainError";
import { EventDispatcher } from "../application/events/EventDispatcher";

describe("CancelBooking", () => {
  const repo = new InMemoryBookingRepository();
  const eventDispatcher = new EventDispatcher();
  const useCase = new CancelBooking(repo, eventDispatcher);
  let booking: Booking;

  beforeEach(async () => {
    const house = new House("acc-1", "Test House", 200);
    booking = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, "user-1");
    await repo.save(booking);
  });

  it("cancels own booking", async () => {
    const result = await useCase.execute({ id: booking.id, userId: "user-1" });

    expect(result.status).toBe("CANCELED");

    const found = await repo.findById(booking.id);
    expect(found).not.toBeNull();
    expect(found!.status).toBe("CANCELED");
  });

  it("throws ValidationError when booking is already rejected", async () => {
    await repo.updateStatus(booking.id, "REJECTED");

    await expect(
      useCase.execute({ id: booking.id, userId: "user-1" }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError when booking is already canceled", async () => {
    await repo.updateStatus(booking.id, "CANCELED");

    await expect(
      useCase.execute({ id: booking.id, userId: "user-1" }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ForbiddenError when cancelling another user's booking", async () => {
    await expect(
      useCase.execute({ id: booking.id, userId: "other-user" }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws BookingNotFoundError when booking does not exist", async () => {
    await expect(
      useCase.execute({ id: "nonexistent", userId: "user-1" }),
    ).rejects.toThrow(BookingNotFoundError);
  });
});
