import { EventHandler } from "./EventDispatcher";
import { BookingCreatedEvent } from "../../domain/events/BookingCreatedEvent";
import { DomainEvent } from "../../domain/events/DomainEvent";

export class ReservationMetricsHandler implements EventHandler {
  private totalBookings = 0;
  private totalRevenue = 0;

  handle(event: DomainEvent): void {
    if (!(event instanceof BookingCreatedEvent)) return;
    const { booking } = event;

    this.totalBookings++;
    this.totalRevenue += booking.totalPrice;

    console.log("\n┌─────────────────────────────────────────────┐");
    console.log("│ 📊 METRICS / AUDIT LOG                     │");
    console.log("├─────────────────────────────────────────────┤");
    console.log(`│ Total bookings  : ${String(this.totalBookings).padEnd(30)}│`);
    console.log(`│ Total revenue   : $${this.totalRevenue.toFixed(2).padEnd(26)}│`);
    console.log(`│ Last booking    : ${booking.id.slice(0, 8).padEnd(30)}│`);
    console.log("└─────────────────────────────────────────────┘\n");
  }
}
