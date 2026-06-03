import { EventHandler } from "./EventDispatcher";
import { BookingCreatedEvent } from "../../domain/events/BookingCreatedEvent";
import { DomainEvent } from "../../domain/events/DomainEvent";

export class ReservationEmailHandler implements EventHandler {
  handle(event: DomainEvent): void {
    if (!(event instanceof BookingCreatedEvent)) return;
    const { booking } = event;

    console.log("\n┌─────────────────────────────────────────────┐");
    console.log("│ 📧 RESERVATION CONFIRMATION EMAIL           │");
    console.log("├─────────────────────────────────────────────┤");
    console.log(`│ Accommodation : ${booking.accommodation.name.padEnd(30)}│`);
    console.log(`│ Check-in      : ${booking.checkIn.toDateString().padEnd(30)}│`);
    console.log(`│ Check-out     : ${booking.checkOut.toDateString().padEnd(30)}│`);
    console.log(`│ Total         : $${booking.totalPrice.toFixed(2).padEnd(26)}│`);
    console.log("└─────────────────────────────────────────────┘\n");
  }
}
