import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CreateBooking } from "../application/use-cases/CreateBooking";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { House } from "../domain/entities/House";
import { PastCheckInError } from "../domain/errors/DomainError";

describe("CreateBooking — timezone boundary", () => {
  let bookingRepo: InMemoryBookingRepository;
  let mockAccommodationRepo: { findById: ReturnType<typeof vi.fn> };
  let mockPricingService: { calculate: ReturnType<typeof vi.fn> };
  let mockEventDispatcher: { dispatch: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  let useCase: CreateBooking;

  const mockHouse = new House("acc-1", "Casa Teste", 200);

  beforeEach(() => {
    vi.useFakeTimers();
    bookingRepo = new InMemoryBookingRepository();
    mockAccommodationRepo = { findById: vi.fn().mockResolvedValue(mockHouse) };
    mockPricingService = { calculate: vi.fn().mockReturnValue({ base: 400, fees: [], total: 400 }) };
    mockEventDispatcher = { dispatch: vi.fn(), register: vi.fn() };
    useCase = new CreateBooking(
      mockAccommodationRepo as any,
      mockPricingService as any,
      bookingRepo,
      mockEventDispatcher as any,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts checkIn when it is today at midnight UTC", async () => {
    const now = new Date("2026-06-08T12:00:00.000Z");
    vi.setSystemTime(now);

    const todayMidnight = new Date("2026-06-08T00:00:00.000Z");
    const tomorrow = new Date("2026-06-11T00:00:00.000Z");

    const booking = await useCase.execute({
      accommodationId: "acc-1",
      checkIn: todayMidnight,
      checkOut: tomorrow,
      userId: "user-1",
    });

    expect(booking).toBeDefined();
    expect(booking.status).toBe("PENDING");
  });

  it("rejects checkIn when it is yesterday", async () => {
    const now = new Date("2026-06-08T12:00:00.000Z");
    vi.setSystemTime(now);

    const yesterday = new Date("2026-06-07T00:00:00.000Z");
    const tomorrow = new Date("2026-06-11T00:00:00.000Z");

    await expect(
      useCase.execute({
        accommodationId: "acc-1",
        checkIn: yesterday,
        checkOut: tomorrow,
        userId: "user-1",
      }),
    ).rejects.toThrow(PastCheckInError);
  });

  it("accepts checkIn when system is near midnight UTC and date is today locally", async () => {
    const now = new Date("2026-06-08T23:00:00.000Z");
    vi.setSystemTime(now);

    const checkIn = new Date("2026-06-08T00:00:00.000Z");
    const checkOut = new Date("2026-06-11T00:00:00.000Z");

    const booking = await useCase.execute({
      accommodationId: "acc-1",
      checkIn,
      checkOut,
      userId: "user-1",
    });

    expect(booking).toBeDefined();
    expect(booking.status).toBe("PENDING");
  });

  it("rejects checkIn from previous UTC day even if local time is still the checkIn date", async () => {
    const now = new Date("2026-06-09T01:00:00.000Z");
    vi.setSystemTime(now);

    const yesterdayUtc = new Date("2026-06-08T00:00:00.000Z");
    const checkOut = new Date("2026-06-11T00:00:00.000Z");

    await expect(
      useCase.execute({
        accommodationId: "acc-1",
        checkIn: yesterdayUtc,
        checkOut,
        userId: "user-1",
      }),
    ).rejects.toThrow(PastCheckInError);
  });
});
