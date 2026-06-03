import type { Accommodation } from "./Accommodation";
import type { Image } from "./Image";

export class Apartment implements Accommodation {
  private readonly CONDO_FEE_RATE = 0.08;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly pricePerNight: number,
    public readonly type = "apartment",
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly ownerId: string = "",
    public readonly images?: Image[],
  ) {}

  calculatePrice(days: number): number {
    const base = this.pricePerNight * days;
    return base + base * this.CONDO_FEE_RATE;
  }
}
