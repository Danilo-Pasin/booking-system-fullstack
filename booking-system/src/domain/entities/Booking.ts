import { Accommodation } from "./Accommodation";
import { randomUUID } from "crypto";
import { calcDays } from "../utils/date";
import { BookingNotPendingError } from "../errors/DomainError";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

export class Booking {
  public readonly basePrice: number;
  public readonly totalPrice: number;
  public readonly id: string;
  public readonly createdAt: Date;

  constructor(
    public readonly accommodation: Accommodation,
    public readonly checkIn: Date,
    public readonly checkOut: Date,
    totalPrice: number,
    public readonly userId: string,
    public status: BookingStatus = "PENDING",
  ) {
    this.id = randomUUID();
    this.createdAt = new Date();
    this.basePrice = accommodation.calculatePrice(this.days);
    this.totalPrice = totalPrice;
  }

  get days(): number {
    return calcDays(this.checkIn, this.checkOut);
  }

  get isPending(): boolean {
    return this.status === "PENDING";
  }

  get isApproved(): boolean {
    return this.status === "APPROVED";
  }

  approve(): void {
    if (!this.isPending) throw new BookingNotPendingError(this.status);
    this.status = "APPROVED";
  }

  reject(): void {
    if (!this.isPending) throw new BookingNotPendingError(this.status);
    this.status = "REJECTED";
  }

  cancel(): void {
    if (this.status === "REJECTED" || this.status === "CANCELED") {
      throw new BookingNotPendingError(this.status);
    }
    this.status = "CANCELED";
  }

  summarize(): string {
    return [
      `Booking #${this.id.slice(0, 8)}`,
      `  Accommodation : ${this.accommodation.name}`,
      `  Check-in      : ${this.checkIn.toDateString()}`,
      `  Check-out     : ${this.checkOut.toDateString()}`,
      `  Days          : ${this.days}`,
      `  Base price    : $${this.basePrice.toFixed(2)}`,
      `  Total price   : $${this.totalPrice.toFixed(2)}`,
      `  Status        : ${this.status}`,
    ].join("\n");
  }
}
