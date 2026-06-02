import { Booking } from "../entities/Booking";
import { DomainEvent } from "./DomainEvent";

export class BookingCreatedEvent implements DomainEvent {
  readonly eventName = "booking.created";
  readonly occurredAt = new Date();

  constructor(public readonly booking: Booking) {}
}
