import { Accommodation } from "./Accommodation";
import { randomUUID } from "crypto";

export class Booking {
  public readonly basePrice: number;
  public readonly totalPrice: number;
  public readonly id: string;
  public readonly createdAt: Date;

  constructor(
    public readonly accommodation: Accommodation,
    public readonly checkIn: Date,
    public readonly checkOut: Date,
    totalPrice: number
  ) {
    this.id = randomUUID();
    this.createdAt = new Date();
    this.basePrice = accommodation.calculatePrice(this.days);
    this.totalPrice = totalPrice;
  }

  get days(): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil(
      (this.checkOut.getTime() - this.checkIn.getTime()) / msPerDay
    );
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
    ].join("\n");
  }
}
