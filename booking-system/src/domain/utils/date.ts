import { InvalidDateRangeError } from "../errors/DomainError";

export function calcDays(checkIn: Date, checkOut: Date): number {
  if (checkOut.getTime() <= checkIn.getTime()) {
    throw new InvalidDateRangeError();
  }
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}
