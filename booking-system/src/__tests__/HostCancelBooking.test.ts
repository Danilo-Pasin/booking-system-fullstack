import { describe, it, expect, beforeEach } from "vitest";
import { HostCancelBooking } from "../application/use-cases/HostCancelBooking";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { Booking } from "../domain/entities/Booking";
import { House } from "../domain/entities/House";
import { BookingNotFoundError, ForbiddenError, ValidationError } from "../domain/errors/DomainError";
import { EventDispatcher } from "../application/events/EventDispatcher";

describe("HostCancelBooking", () => {
  const repo = new InMemoryBookingRepository();
  const eventDispatcher = new EventDispatcher();
  const useCase = new HostCancelBooking(repo, eventDispatcher);

  const ownerId = "host-1";
  const guestId = "guest-1";
  let house: House;
  let booking: Booking;

  beforeEach(async () => {
    house = new House("acc-1", "Test House", 200, "house", undefined, undefined, ownerId);
    booking = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, guestId);
    await repo.save(booking);
  });

  it("cancels a booking as the host (owner)", async () => {
    const result = await useCase.execute({ bookingId: booking.id, userId: ownerId });

    expect(result.status).toBe("CANCELED");

    const found = await repo.findById(booking.id);
    expect(found).not.toBeNull();
    expect(found!.status).toBe("CANCELED");
  });

  it("throws ValidationError when booking is already rejected", async () => {
    await repo.updateStatus(booking.id, "REJECTED");

    await expect(
      useCase.execute({ bookingId: booking.id, userId: ownerId }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError when booking is already canceled", async () => {
    await repo.updateStatus(booking.id, "CANCELED");

    await expect(
      useCase.execute({ bookingId: booking.id, userId: ownerId }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ForbiddenError when user is not the accommodation owner", async () => {
    await expect(
      useCase.execute({ bookingId: booking.id, userId: "other-user" }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws BookingNotFoundError when booking does not exist", async () => {
    await expect(
      useCase.execute({ bookingId: "nonexistent", userId: ownerId }),
    ).rejects.toThrow(BookingNotFoundError);
  });
});
