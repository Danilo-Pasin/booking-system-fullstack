import { EventHandler } from "./EventDispatcher";
import { BookingCreatedEvent } from "../../domain/events/BookingCreatedEvent";
import { BookingStatusChangedEvent } from "../../domain/events/BookingStatusChangedEvent";
import { DomainEvent } from "../../domain/events/DomainEvent";
import type { MailSender } from "../../domain/services/MailSender";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { formatCurrency } from "../../lib/currency";

export class ReservationEmailHandler implements EventHandler {
  constructor(
    private readonly mailService: MailSender,
    private readonly userRepository: UserRepository,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    try {
      if (event instanceof BookingCreatedEvent) {
        await this.handleBookingCreated(event);
      } else if (event instanceof BookingStatusChangedEvent) {
        await this.handleStatusChanged(event);
      }
    } catch (err) {
      console.error("Failed to send email notification:", err);
    }
  }

  private async handleBookingCreated(event: BookingCreatedEvent): Promise<void> {
    const { booking } = event;
    const owner = await this.userRepository.findById(booking.accommodation.ownerId);
    if (!owner) return;

    const subject = `Nova solicitação de reserva - ${booking.accommodation.name}`;
    const html = `
      <h2>Nova solicitação de reserva</h2>
      <p><strong>Acomodação:</strong> ${booking.accommodation.name}</p>
      <p><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString("pt-BR")}</p>
      <p><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString("pt-BR")}</p>
      <p><strong>Total:</strong> ${formatCurrency(booking.totalPrice)}</p>
      <p>A reserva está aguardando sua aprovação.</p>
    `;

    await this.mailService.send(owner.email, subject, html);
  }

  private async handleStatusChanged(event: BookingStatusChangedEvent): Promise<void> {
    const { booking, previousStatus, newStatus, actorId } = event;

    if (newStatus === "APPROVED") {
      await this.sendApprovedEmail(booking);
    } else if (newStatus === "REJECTED") {
      await this.sendRejectedEmail(booking);
    } else if (newStatus === "CANCELED") {
      await this.sendCanceledEmail(booking, actorId);
    }
  }

  private async sendApprovedEmail(booking: any): Promise<void> {
    if (!booking.userEmail) return;
    const subject = `Reserva aprovada - ${booking.accommodation.name}`;
    const html = `
      <h2>✅ Reserva aprovada!</h2>
      <p><strong>Acomodação:</strong> ${booking.accommodation.name}</p>
      <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString("pt-BR")}</p>
      <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString("pt-BR")}</p>
      <p><strong>Total:</strong> ${formatCurrency(booking.totalPrice)}</p>
      <p>Sua reserva foi aprovada pelo anfitrião!</p>
    `;
    await this.mailService.send(booking.userEmail, subject, html);
  }

  private async sendRejectedEmail(booking: any): Promise<void> {
    if (!booking.userEmail) return;
    const subject = `Reserva recusada - ${booking.accommodation.name}`;
    const html = `
      <h2>❌ Reserva recusada</h2>
      <p><strong>Acomodação:</strong> ${booking.accommodation.name}</p>
      <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString("pt-BR")}</p>
      <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString("pt-BR")}</p>
      <p>Sua reserva foi recusada pelo anfitrião.</p>
    `;
    await this.mailService.send(booking.userEmail, subject, html);
  }

  private async sendCanceledEmail(booking: any, actorId: string): Promise<void> {
    const canceledByGuest = actorId === booking.userId;

    if (canceledByGuest) {
      // Guest canceled → notify host
      const owner = await this.userRepository.findById(booking.accommodation.ownerId);
      if (!owner) return;
      const subject = `Reserva cancelada pelo hóspede - ${booking.accommodation.name}`;
      const html = `
        <h2>🚫 Reserva cancelada</h2>
        <p><strong>Acomodação:</strong> ${booking.accommodation.name}</p>
        <p><strong>Hóspede:</strong> ${booking.userName}</p>
        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString("pt-BR")}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString("pt-BR")}</p>
        <p>O hóspede cancelou a reserva.</p>
      `;
      await this.mailService.send(owner.email, subject, html);
    } else {
      // Host canceled → notify guest
      if (!booking.userEmail) return;
      const subject = `Reserva cancelada pelo anfitrião - ${booking.accommodation.name}`;
      const html = `
        <h2>🚫 Reserva cancelada</h2>
        <p><strong>Acomodação:</strong> ${booking.accommodation.name}</p>
        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString("pt-BR")}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString("pt-BR")}</p>
        <p>Sua reserva foi cancelada pelo anfitrião.</p>
      `;
      await this.mailService.send(booking.userEmail, subject, html);
    }
  }
}
