import { describe, it, expect, beforeEach } from "vitest";
import { ListUserBookings } from "../application/use-cases/ListUserBookings";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { Booking } from "../domain/entities/Booking";
import { House } from "../domain/entities/House";

describe("ListUserBookings", () => {
  const repo = new InMemoryBookingRepository();
  const useCase = new ListUserBookings(repo);

  beforeEach(async () => {
    const house = new House("acc-1", "Test House", 200);
    const userABooking1 = new Booking(
      house,
      new Date("2026-07-10"),
      new Date("2026-07-13"),
      600,
      "user-a",
    );
    const userABooking2 = new Booking(
      house,
      new Date("2026-08-01"),
      new Date("2026-08-05"),
      800,
      "user-a",
    );
    const userBBooking = new Booking(
      house,
      new Date("2026-09-10"),
      new Date("2026-09-12"),
      400,
      "user-b",
    );

    await repo.save(userABooking1);
    await repo.save(userABooking2);
    await repo.save(userBBooking);
  });

  it("returns only the user's bookings", async () => {
    const result = await useCase.execute({ userId: "user-a" });

    expect(result).toHaveLength(2);
    result.forEach((b) => expect(b.userId).toBe("user-a"));
  });

  it("returns empty array when user has no bookings", async () => {
    const result = await useCase.execute({ userId: "user-c" });

    expect(result).toEqual([]);
  });
});
