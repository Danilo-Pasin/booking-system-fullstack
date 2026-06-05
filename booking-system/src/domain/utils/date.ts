import { InvalidDateRangeError } from "../errors/DomainError";

export function calcDays(checkIn: Date, checkOut: Date): number {
  if (checkOut.getTime() <= checkIn.getTime()) {
    throw new InvalidDateRangeError();
  }
  const diff = checkOut.getTime() - checkIn.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(diff / msPerDay);
}
