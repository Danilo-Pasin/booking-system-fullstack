import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateBooking } from "../application/use-cases/CreateBooking";
import { InMemoryBookingRepository } from "../infra/repositories/InMemoryBookingRepository";
import { House } from "../domain/entities/House";
import {
  InvalidDateRangeError,
  PastCheckInError,
  AccommodationNotFoundError,
  AccommodationUnavailableError,
} from "../domain/errors/DomainError";
import { BookingCreatedEvent } from "../domain/events/BookingCreatedEvent";
import { Booking } from "../domain/entities/Booking";

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(12, 0, 0, 0);
  return d;
}

const mockHouse = new House("acc-1", "Test House", 200);

describe("CreateBooking", () => {
  let bookingRepo: InMemoryBookingRepository;
  let mockAccommodationRepo: { findById: ReturnType<typeof vi.fn> };
  let mockPricingService: { calculate: ReturnType<typeof vi.fn> };
  let mockEventDispatcher: { dispatch: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  let useCase: CreateBooking;

  beforeEach(() => {
    bookingRepo = new InMemoryBookingRepository();
    mockAccommodationRepo = { findById: vi.fn().mockResolvedValue(mockHouse) };
    mockPricingService = { calculate: vi.fn().mockReturnValue({ base: 1080, fees: [], total: 100 }) };
    mockEventDispatcher = { dispatch: vi.fn(), register: vi.fn() };
    useCase = new CreateBooking(
      mockAccommodationRepo as any,
      mockPricingService as any,
      bookingRepo,
      mockEventDispatcher as any,
    );
  });

  it("creates a valid booking with correct dates, pricing called, event dispatched", async () => {
    const checkIn = futureDate(10);
    const checkOut = futureDate(13);

    const booking = await useCase.execute({
      accommodationId: "acc-1",
      checkIn,
      checkOut,
      userId: "user-1",
    });

    expect(booking).toBeDefined();
    expect(booking.userId).toBe("user-1");
    expect(booking.checkIn).toEqual(checkIn);
    expect(booking.checkOut).toEqual(checkOut);
    expect(mockPricingService.calculate).toHaveBeenCalledOnce();
    expect(mockEventDispatcher.dispatch).toHaveBeenCalledOnce();
  });

  it("throws InvalidDateRangeError when checkOut is before checkIn", async () => {
    const checkIn = futureDate(10);
    const checkOut = futureDate(5);

    await expect(
      useCase.execute({
        accommodationId: "acc-1",
        checkIn,
        checkOut,
        userId: "user-1",
      }),
    ).rejects.toThrow(InvalidDateRangeError);
  });

  it("throws PastCheckInError when checkIn is in the past", async () => {
    const past = new Date("2020-01-01");
    const checkOut = new Date("2020-01-05");

    await expect(
      useCase.execute({
        accommodationId: "acc-1",
        checkIn: past,
        checkOut,
        userId: "user-1",
      }),
    ).rejects.toThrow(PastCheckInError);
  });

  it("throws when accommodation is not found", async () => {
    mockAccommodationRepo.findById.mockRejectedValue(new AccommodationNotFoundError());

    await expect(
      useCase.execute({
        accommodationId: "nonexistent",
        checkIn: futureDate(10),
        checkOut: futureDate(13),
        userId: "user-1",
      }),
    ).rejects.toThrow(AccommodationNotFoundError);
  });

  it("allows multiple PENDING bookings for overlapping dates", async () => {
    const checkIn = futureDate(10);
    const checkOut = futureDate(13);

    const first = await useCase.execute({
      accommodationId: "acc-1",
      checkIn,
      checkOut,
      userId: "user-1",
    });

    expect(first.status).toBe("PENDING");

    const overlappingCheckIn = futureDate(11);
    const overlappingCheckOut = futureDate(14);

    const second = await useCase.execute({
      accommodationId: "acc-1",
      checkIn: overlappingCheckIn,
      checkOut: overlappingCheckOut,
      userId: "user-2",
    });

    expect(second.status).toBe("PENDING");
    expect(second.id).not.toBe(first.id);
  });

  it("throws AccommodationUnavailableError when dates conflict with APPROVED booking", async () => {
    const checkIn = futureDate(10);
    const checkOut = futureDate(13);

    const first = await useCase.execute({
      accommodationId: "acc-1",
      checkIn,
      checkOut,
      userId: "user-1",
    });

    await bookingRepo.updateStatus(first.id, "APPROVED");

    const overlappingCheckIn = futureDate(11);
    const overlappingCheckOut = futureDate(14);

    await expect(
      useCase.execute({
        accommodationId: "acc-1",
        checkIn: overlappingCheckIn,
        checkOut: overlappingCheckOut,
        userId: "user-2",
      }),
    ).rejects.toThrow(AccommodationUnavailableError);
  });

  it("dispatches BookingCreatedEvent on successful booking", async () => {
    const checkIn = futureDate(10);
    const checkOut = futureDate(13);

    await useCase.execute({
      accommodationId: "acc-1",
      checkIn,
      checkOut,
      userId: "user-1",
    });

    expect(mockEventDispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
      expect.any(BookingCreatedEvent),
    );
  });
});
