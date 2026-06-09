import type { BookingSummary } from "../repositories/BookingRepository";
import type { BookingStatus } from "../entities/Booking";
import type { DomainEvent } from "./DomainEvent";

export class BookingStatusChangedEvent implements DomainEvent {
  readonly eventName = "booking.status_changed";
  readonly occurredAt = new Date();

  constructor(
    public readonly booking: BookingSummary,
    public readonly previousStatus: BookingStatus,
    public readonly newStatus: BookingStatus,
    public readonly actorId: string,
  ) {}
}
