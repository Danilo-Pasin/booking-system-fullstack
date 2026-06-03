import type { Accommodation } from "./Accommodation";
import type { Image } from "./Image";

export class SharedRoom implements Accommodation {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly pricePerNight: number,
    public readonly type = "shared_room",
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly ownerId: string = "",
    public readonly images?: Image[],
  ) {}

  calculatePrice(days: number): number {
    return this.pricePerNight * days;
  }
}
