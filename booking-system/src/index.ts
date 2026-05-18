import { House } from "./domain/entities/House";
import { Apartment } from "./domain/entities/Apartment";
import { SharedRoom } from "./domain/entities/SharedRoom";
import {
  PlatformFee,
  ServiceFee,
  DiscountCoupon,
} from "./domain/fees/Fee";
import { PricingService } from "./application/services/PricingService";
import { CreateBooking } from "./application/use-cases/CreateBooking";
import { PrismaBookingRepository } from "./infra/repositories/PrismaBookingRepository";
import { PreviewBookingPrice } from "./application/use-cases/PreviewBookingPrice";
import { PrismaAccommodationRepository } from "./infra/repositories/PrismaAccommodationRepository";

// ──────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────
function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function separator(label: string) {
  console.log(`\n${"─".repeat(50)}`);
  console.log(` ${label}`);
  console.log("─".repeat(50));
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  const repo = new PrismaAccommodationRepository();

  await repo.save(new House("h-001", "Beach House in Florianópolis", 350));
  await repo.save(new Apartment("a-001", "Studio in São Paulo - Pinheiros", 180));
  await repo.save(new SharedRoom("s-001", "Shared Room in Hostel, Búzios", 60));

  const standardFees = [new PlatformFee(), new ServiceFee(0.03)];
  const bookingRepo = new PrismaBookingRepository();
  const pricingService = new PricingService(standardFees);
  const createBooking = new CreateBooking(repo, pricingService, bookingRepo);
  const previewPrice = new PreviewBookingPrice(repo, pricingService);

  // Example 1 — Preview price for House (5 nights)
  separator("PREVIEW — Beach House (5 nights)");
  const preview = await previewPrice.execute({
    accommodationId: "h-001",
    checkIn: futureDate(5),
    checkOut: futureDate(10),
  });
  console.log(`  Base price : $${preview.base.toFixed(2)}`);
  preview.fees.forEach((f) =>
    console.log(`  ${f.name.padEnd(16)}: $${f.amount.toFixed(2)}`)
  );
  console.log(`  ${"TOTAL".padEnd(16)}: $${preview.total.toFixed(2)}`);

  // Example 2 — Create booking for Apartment (3 nights)
  separator("BOOKING — Apartment (3 nights)");
  const aptBooking = await createBooking.execute({
    accommodationId: "a-001",
    checkIn: futureDate(2),
    checkOut: futureDate(5),
  });
  console.log(aptBooking.summarize());

  // Example 3 — Shared Room with discount coupon
  separator("BOOKING — Shared Room + 10% Coupon");
  const discountedPricing = new PricingService([
    new PlatformFee(),
    new ServiceFee(0.03),
    new DiscountCoupon("WELCOME10", 0.10),
  ]);
  const discountedCreate = new CreateBooking(repo, discountedPricing, bookingRepo);
  const sharedBooking = await discountedCreate.execute({
    accommodationId: "s-001",
    checkIn: futureDate(1),
    checkOut: futureDate(4),
  });
  console.log(sharedBooking.summarize());

  // Example 4 — Validation error
  separator("VALIDATION — Check-out before check-in");
  try {
    await createBooking.execute({
      accommodationId: "h-001",
      checkIn: futureDate(10),
      checkOut: futureDate(5),
    });
  } catch (err) {
    console.log(`  ✗ Error caught: ${(err as Error).message}`);
  }
}

main().catch(console.error);