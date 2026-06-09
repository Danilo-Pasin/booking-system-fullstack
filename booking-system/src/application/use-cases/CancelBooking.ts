import { BookingRepository, BookingSummary } from "../../domain/repositories/BookingRepository";
import { BookingNotFoundError, ForbiddenError, ValidationError } from "../../domain/errors/DomainError";
import { EventDispatcher } from "../events/EventDispatcher";
import { BookingStatusChangedEvent } from "../../domain/events/BookingStatusChangedEvent";
import type { BookingStatus } from "../../domain/entities/Booking";

export interface CancelBookingInput {
  id: string;
  userId: string;
}

export class CancelBooking {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(input: CancelBookingInput): Promise<BookingSummary> {
    const booking = await this.bookingRepository.findById(input.id);

    if (!booking) {
      throw new BookingNotFoundError();
    }

    if (booking.userId !== input.userId) {
      throw new ForbiddenError("Esta reserva não pertence a você.");
    }

    if (booking.status === "REJECTED" || booking.status === "CANCELED") {
      throw new ValidationError("Esta reserva não pode ser cancelada pois já está " + (booking.status === "REJECTED" ? "recusada" : "cancelada") + ".");
    }

    const previousStatus = booking.status as BookingStatus;
    const updated = await this.bookingRepository.updateStatus(input.id, "CANCELED");

    this.eventDispatcher.dispatch(
      new BookingStatusChangedEvent(
        updated,
        previousStatus,
        "CANCELED",
        input.userId,
      )
    );

    return updated;
  }
}
