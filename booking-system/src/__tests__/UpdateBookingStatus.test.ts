import { describe, it, expect, beforeEach } from "vitest";
import { UpdateBookingStatus } from "../application/use-cases/UpdateBookingStatus";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { Booking } from "../domain/entities/Booking";
import { House } from "../domain/entities/House";
import {
  BookingNotFoundError,
  BookingNotPendingError,
  ValidationError,
  ForbiddenError,
  BookingAlreadyApprovedError,
} from "../domain/errors/DomainError";
import { EventDispatcher } from "../application/events/EventDispatcher";

describe("UpdateBookingStatus", () => {
  const repo = new InMemoryBookingRepository();
  const eventDispatcher = new EventDispatcher();
  const useCase = new UpdateBookingStatus(repo, eventDispatcher);

  const ownerId = "host-1";
  const guestId = "guest-1";
  let house: House;
  let pendingBooking: Booking;

  beforeEach(async () => {
    house = new House("acc-1", "Test House", 200, "house", undefined, undefined, ownerId);
    pendingBooking = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, guestId);
    await repo.save(pendingBooking);
  });

  it("approves a pending booking", async () => {
    const result = await useCase.execute({
      bookingId: pendingBooking.id,
      status: "APPROVED",
      userId: ownerId,
    });

    expect(result.status).toBe("APPROVED");
  });

  it("rejects a pending booking", async () => {
    const result = await useCase.execute({
      bookingId: pendingBooking.id,
      status: "REJECTED",
      userId: ownerId,
    });

    expect(result.status).toBe("REJECTED");
  });

  it("throws BookingNotPendingError when booking is already approved", async () => {
    const approved = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, guestId, "APPROVED");
    await repo.save(approved);

    await expect(
      useCase.execute({
        bookingId: approved.id,
        status: "REJECTED",
        userId: ownerId,
      }),
    ).rejects.toThrow(BookingNotPendingError);
  });

  it("throws BookingNotPendingError when booking is already rejected", async () => {
    const rejected = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, guestId, "REJECTED");
    await repo.save(rejected);

    await expect(
      useCase.execute({
        bookingId: rejected.id,
        status: "APPROVED",
        userId: ownerId,
      }),
    ).rejects.toThrow(BookingNotPendingError);
  });

  it("throws ForbiddenError when user is not the accommodation owner", async () => {
    await expect(
      useCase.execute({
        bookingId: pendingBooking.id,
        status: "APPROVED",
        userId: "other-user",
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws BookingNotFoundError when booking does not exist", async () => {
    await expect(
      useCase.execute({
        bookingId: "nonexistent",
        status: "APPROVED",
        userId: ownerId,
      }),
    ).rejects.toThrow(BookingNotFoundError);
  });

  it("throws ValidationError for invalid status", async () => {
    await expect(
      useCase.execute({
        bookingId: pendingBooking.id,
        status: "INVALID",
        userId: ownerId,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws BookingAlreadyApprovedError when another APPROVED booking exists for same dates", async () => {
    const approved = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, guestId, "APPROVED");
    await repo.save(approved);

    const secondBooking = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, "guest-2");
    await repo.save(secondBooking);

    await expect(
      useCase.execute({
        bookingId: secondBooking.id,
        status: "APPROVED",
        userId: ownerId,
      }),
    ).rejects.toThrow(BookingAlreadyApprovedError);
  });

  it("allows rejection even when another APPROVED booking exists for same dates", async () => {
    const approved = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, guestId, "APPROVED");
    await repo.save(approved);

    const secondBooking = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, "guest-2");
    await repo.save(secondBooking);

    const result = await useCase.execute({
      bookingId: secondBooking.id,
      status: "REJECTED",
      userId: ownerId,
    });

    expect(result.status).toBe("REJECTED");
  });
});
