import { describe, it, expect, beforeEach } from "vitest";
import { GetBookingById } from "../application/use-cases/GetBookingById";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { Booking } from "../domain/entities/Booking";
import { House } from "../domain/entities/House";
import { NotFoundError, ForbiddenError } from "../domain/errors/DomainError";

describe("GetBookingById", () => {
  const repo = new InMemoryBookingRepository();
  const useCase = new GetBookingById(repo);
  let booking: Booking;

  beforeEach(async () => {
    const house = new House("acc-1", "Test House", 200);
    booking = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, "user-1");
    await repo.save(booking);
  });

  it("returns booking when user owns it", async () => {
    const result = await useCase.execute({
      bookingId: booking.id,
      userId: "user-1",
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(booking.id);
    expect(result.userId).toBe("user-1");
  });

  it("throws ForbiddenError when booking belongs to another user", async () => {
    await expect(
      useCase.execute({ bookingId: booking.id, userId: "other-user" }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError when booking does not exist", async () => {
    await expect(
      useCase.execute({ bookingId: "nonexistent", userId: "user-1" }),
    ).rejects.toThrow(NotFoundError);
  });
});
