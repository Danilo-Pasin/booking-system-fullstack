import type { Image } from "./Image";

export interface Accommodation {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  description?: string;
  imageUrl?: string;
  images?: Image[];
  ownerId: string;
  calculatePrice(days: number): number;
}
