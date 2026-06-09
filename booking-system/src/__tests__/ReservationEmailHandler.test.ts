import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReservationEmailHandler } from "../application/events/ReservationEmailHandler";
import { BookingCreatedEvent } from "../domain/events/BookingCreatedEvent";
import { BookingStatusChangedEvent } from "../domain/events/BookingStatusChangedEvent";
import { Booking } from "../domain/entities/Booking";
import { House } from "../domain/entities/House";
import type { BookingSummary } from "../domain/repositories/BookingRepository";
import type { MailSender } from "../domain/services/MailSender";
import type { UserRepository } from "../domain/repositories/UserRepository";
import type { User } from "../domain/entities/User";

function makeSummary(booking: Booking, userName = "Guest", userEmail?: string): BookingSummary {
  return {
    id: booking.id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    basePrice: booking.basePrice,
    totalPrice: booking.totalPrice,
    status: booking.status,
    createdAt: booking.createdAt,
    userId: booking.userId,
    userName,
    userEmail,
    accommodation: {
      id: booking.accommodation.id,
      name: booking.accommodation.name,
      type: booking.accommodation.type,
      ownerId: booking.accommodation.ownerId,
    },
  };
}

describe("ReservationEmailHandler", () => {
  let mailSender: MailSender;
  let userRepository: UserRepository;
  let handler: ReservationEmailHandler;
  let sendSpy: MailSender["send"];

  const ownerId = "host-1";
  const guestId = "guest-1";
  const guestEmail = "guest@test.com";
  let house: House;
  let booking: Booking;

  const mockOwner: User = {
    id: ownerId,
    name: "Owner",
    email: "owner@test.com",
    password: "hash",
    role: "HOST",
    createdAt: new Date("2024-01-01"),
  };

  beforeEach(() => {
    sendSpy = vi.fn().mockResolvedValue(undefined);

    mailSender = { send: sendSpy };

    userRepository = {
      save: vi.fn(),
      update: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn().mockImplementation(async (id: string) => {
        if (id === ownerId) return mockOwner;
        return null;
      }),
    };

    handler = new ReservationEmailHandler(mailSender, userRepository);

    house = new House("acc-1", "Casa Teste", 200, "house", undefined, undefined, ownerId);
    booking = new Booking(house, new Date("2026-07-10"), new Date("2026-07-13"), 600, guestId);
  });

  it("sends email to owner on BookingCreatedEvent", async () => {
    const event = new BookingCreatedEvent(booking);
    await handler.handle(event);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(
      "owner@test.com",
      expect.stringContaining("Nova solicitação"),
      expect.stringContaining("Casa Teste"),
    );
  });

  it("sends approved email to guest on APPROVED status change", async () => {
    const summary = makeSummary(booking, "Guest", guestEmail);
    const event = new BookingStatusChangedEvent(summary, "PENDING" as any, "APPROVED" as any, ownerId);
    await handler.handle(event);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(
      guestEmail,
      expect.stringContaining("aprovada"),
      expect.any(String),
    );
  });

  it("sends rejected email to guest on REJECTED status change", async () => {
    const summary = makeSummary(booking, "Guest", guestEmail);
    const event = new BookingStatusChangedEvent(summary, "PENDING" as any, "REJECTED" as any, ownerId);
    await handler.handle(event);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(
      guestEmail,
      expect.stringContaining("recusada"),
      expect.any(String),
    );
  });

  it("sends canceled-by-guest email to host when actorId matches guest", async () => {
    const summary = makeSummary(booking, "Guest", guestEmail);
    const event = new BookingStatusChangedEvent(summary, "APPROVED" as any, "CANCELED" as any, guestId);
    await handler.handle(event);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(
      "owner@test.com",
      expect.stringContaining("cancelada pelo hóspede"),
      expect.any(String),
    );
  });

  it("sends canceled-by-host email to guest when actorId does not match guest", async () => {
    const summary = makeSummary(booking, "Guest", guestEmail);
    const event = new BookingStatusChangedEvent(summary, "APPROVED" as any, "CANCELED" as any, ownerId);
    await handler.handle(event);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(
      guestEmail,
      expect.stringContaining("cancelada pelo anfitrião"),
      expect.any(String),
    );
  });

  it("does not throw when mail sending fails (handler catches errors)", async () => {
    (sendSpy as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("SMTP error"));
    const event = new BookingCreatedEvent(booking);

    await expect(handler.handle(event)).resolves.toBeUndefined();
  });

  it("does nothing when owner is not found on BookingCreatedEvent", async () => {
    const spy = vi.mocked(userRepository.findById).mockResolvedValue(null);
    const event = new BookingCreatedEvent(booking);

    await handler.handle(event);

    expect(sendSpy).not.toHaveBeenCalled();
  });
});
