export interface Accommodation {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  calculatePrice(days: number): number;
}