import { Accommodation } from "./Accommodation";

export class SharedRoom implements Accommodation {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly pricePerNight: number,
    public readonly type = "shared_room"
  ) {}

  calculatePrice(days: number): number {
    return this.pricePerNight * days; // No additional fees
  }
}
