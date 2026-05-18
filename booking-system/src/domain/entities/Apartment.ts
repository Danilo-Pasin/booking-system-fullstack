import { Accommodation } from "./Accommodation";

export class Apartment implements Accommodation {
  private readonly CONDO_FEE_RATE = 0.08; // 8% condominium fee

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly pricePerNight: number,
    public readonly type = "apartment"
  ) {}

  calculatePrice(days: number): number {
    const base = this.pricePerNight * days;
    return base + base * this.CONDO_FEE_RATE;
  }
}
