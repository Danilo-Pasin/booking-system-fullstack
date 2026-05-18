import { Accommodation } from "./Accommodation";

export class House implements Accommodation {
  private readonly CLEANING_FEE = 80;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly pricePerNight: number,
    public readonly type = "house"
  ) {}

  calculatePrice(days: number): number {
    return this.pricePerNight * days + this.CLEANING_FEE;
  }
}
