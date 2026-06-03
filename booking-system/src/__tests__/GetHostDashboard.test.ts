import { describe, it, expect, beforeEach } from "vitest";
import { GetHostDashboard } from "../application/use-cases/GetHostDashboard";
import { InMemoryAccommodationRepository } from "../infra/repositories/InMemoryAccommodationRepository";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { AccommodationFactory } from "../domain/factories/AccommodationFactory";
import { Booking } from "../domain/entities/Booking";

describe("GetHostDashboard", () => {
  let accommodationRepo: InMemoryAccommodationRepository;
  let bookingRepo: InMemoryBookingRepository;
  const factory = new AccommodationFactory();

  beforeEach(() => {
    accommodationRepo = new InMemoryAccommodationRepository();
    bookingRepo = new InMemoryBookingRepository();
  });

  it("returns correct counts and revenue for host with data", async () => {
    const hostId = "host-1";
    const useCase = new GetHostDashboard(accommodationRepo, bookingRepo);

    const a1 = factory.create({
      id: "a1",
      name: "House",
      type: "house",
      pricePerNight: 100,
      ownerId: hostId,
    });
    const a2 = factory.create({
      id: "a2",
      name: "Apt",
      type: "apartment",
      pricePerNight: 200,
      ownerId: hostId,
    });
    await accommodationRepo.save(a1);
    await accommodationRepo.save(a2);

    const b1 = new Booking(a1, new Date("2026-06-01"), new Date("2026-06-05"), 500, "user-1");
    b1.approve();
    await bookingRepo.save(b1);
    const b2 = new Booking(a2, new Date("2026-06-10"), new Date("2026-06-12"), 400, "user-2");
    b2.approve();
    await bookingRepo.save(b2);

    const result = await useCase.execute({ ownerId: hostId });

    expect(result.accommodationsCount).toBe(2);
    expect(result.bookingsCount).toBe(2);
    expect(result.estimatedRevenue).toBe(900);
  });

  it("returns zeros for host with no data", async () => {
    const useCase = new GetHostDashboard(accommodationRepo, bookingRepo);

    const result = await useCase.execute({ ownerId: "host-with-nothing" });

    expect(result.accommodationsCount).toBe(0);
    expect(result.bookingsCount).toBe(0);
    expect(result.estimatedRevenue).toBe(0);
  });

  it("calculates estimatedRevenue correctly from booking totals", async () => {
    const hostId = "host-1";
    const useCase = new GetHostDashboard(accommodationRepo, bookingRepo);

    const a1 = factory.create({
      id: "a1",
      name: "House",
      type: "house",
      pricePerNight: 100,
      ownerId: hostId,
    });
    await accommodationRepo.save(a1);

    const b1 = new Booking(a1, new Date("2026-07-01"), new Date("2026-07-04"), 350, "user-1");
    b1.approve();
    await bookingRepo.save(b1);
    const b2 = new Booking(a1, new Date("2026-08-01"), new Date("2026-08-05"), 500, "user-2");
    b2.approve();
    await bookingRepo.save(b2);

    const result = await useCase.execute({ ownerId: hostId });

    expect(result.estimatedRevenue).toBe(850);
  });
});
