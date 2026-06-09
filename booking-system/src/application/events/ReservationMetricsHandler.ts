import { EventHandler } from "./EventDispatcher";
import { BookingCreatedEvent } from "../../domain/events/BookingCreatedEvent";
import { DomainEvent } from "../../domain/events/DomainEvent";
import { formatCurrency } from "../../lib/currency";

export class ReservationMetricsHandler implements EventHandler {
  private totalBookings = 0;
  private totalRevenue = 0;

  handle(event: DomainEvent): void {
    if (!(event instanceof BookingCreatedEvent)) return;
    const { booking } = event;

    this.totalBookings++;
    this.totalRevenue += booking.totalPrice;

    console.log("\n┌─────────────────────────────────────────────┐");
    console.log("│ 📊 MÉTRICAS / LOG DE AUDITORIA             │");
    console.log("├─────────────────────────────────────────────┤");
    console.log(`│ Total reservas : ${String(this.totalBookings).padEnd(30)}│`);
    console.log(`│ Receita total  : ${formatCurrency(this.totalRevenue).padEnd(29)}│`);
    console.log(`│ Última reserva : ${booking.id.slice(0, 8).padEnd(30)}│`);
    console.log("└─────────────────────────────────────────────┘\n");
  }
}
