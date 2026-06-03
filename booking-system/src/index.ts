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
import { PrismaUserRepository } from "./infra/repositories/PrismaUserRepository";
import { RegisterUser } from "./application/use-cases/RegisterUser";
import { CreateAccommodation } from "./application/use-cases/CreateAccommodation";
import { UpdateAccommodation } from "./application/use-cases/UpdateAccommodation";
import { DeleteAccommodation } from "./application/use-cases/DeleteAccommodation";
import { EventDispatcher } from "./application/events/EventDispatcher";
import { ReservationEmailHandler } from "./application/events/ReservationEmailHandler";
import { ReservationMetricsHandler } from "./application/events/ReservationMetricsHandler";
import { randomUUID } from "crypto";

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
  const userRepo = new PrismaUserRepository();
  const registerUser = new RegisterUser(userRepo);

  // Create a default host for seed accommodations
  const hostUser = await registerUser.execute({
    name: "Default Host",
    email: `host-${randomUUID().slice(0, 8)}@example.com`,
    password: "password123",
    role: "HOST",
  });
  console.log(`\n  Host created: ${hostUser.email} (${hostUser.id})`);

  // Seed accommodations with ownerId
  await repo.save(new House("h-001", "Beach House in Florianópolis", 350, "house", undefined, hostUser.id));
  await repo.save(new Apartment("a-001", "Studio in São Paulo - Pinheiros", 180, "apartment", undefined, hostUser.id));
  await repo.save(new SharedRoom("s-001", "Shared Room in Hostel, Búzios", 60, "shared_room", undefined, hostUser.id));

  // Create a test GUEST user for booking demos
  const testEmail = `test-${randomUUID().slice(0, 8)}@example.com`;
  const testUser = await registerUser.execute({
    name: "Test User",
    email: testEmail,
    password: "password123",
  });
  console.log(`  Guest created: ${testUser.email} (${testUser.id})`);

  // Demo: CreateAccommodation use case
  separator("HOST — Create Accommodation");
  const createAccommodation = new CreateAccommodation(repo);
  const newAccommodation = await createAccommodation.execute({
    name: "New Beach House",
    type: "house",
    pricePerNight: 400,
    description: "A beautiful beach house with ocean view",
    ownerId: hostUser.id,
  });
  console.log(`  Created: ${newAccommodation.name} (${newAccommodation.id})`);

  // Demo: UpdateAccommodation use case
  separator("HOST — Update Accommodation");
  const updateAccommodation = new UpdateAccommodation(repo);
  const updated = await updateAccommodation.execute({
    id: newAccommodation.id,
    name: "New Beach House - Updated",
    pricePerNight: 450,
    ownerId: hostUser.id,
  });
  console.log(`  Updated: ${updated.name} ($${updated.pricePerNight}/night)`);

  // Demo: DeleteAccommodation use case
  separator("HOST — Delete Accommodation");
  const deleteAccommodation = new DeleteAccommodation(repo);
  await deleteAccommodation.execute({ id: newAccommodation.id, ownerId: hostUser.id });
  console.log(`  Deleted: ${newAccommodation.name}`);

  const standardFees = [new PlatformFee(), new ServiceFee(0.03)];
  const bookingRepo = new PrismaBookingRepository();
  const pricingService = new PricingService(standardFees);

  const eventDispatcher = new EventDispatcher();
  eventDispatcher.register("booking.created", new ReservationEmailHandler());
  eventDispatcher.register("booking.created", new ReservationMetricsHandler());

  const createBooking = new CreateBooking(repo, pricingService, bookingRepo, eventDispatcher);
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
    userId: testUser.id,
  });
  console.log(aptBooking.summarize());

  // Example 3 — Shared Room with discount coupon
  separator("BOOKING — Shared Room + 10% Coupon");
  const discountedPricing = new PricingService([
    new PlatformFee(),
    new ServiceFee(0.03),
    new DiscountCoupon("WELCOME10", 0.10),
  ]);
  const discountedCreate = new CreateBooking(repo, discountedPricing, bookingRepo, eventDispatcher);
  const sharedBooking = await discountedCreate.execute({
    accommodationId: "s-001",
    checkIn: futureDate(1),
    checkOut: futureDate(4),
    userId: testUser.id,
  });
  console.log(sharedBooking.summarize());

  // Example 4 — Validation error
  separator("VALIDATION — Check-out before check-in");
  try {
    await createBooking.execute({
      accommodationId: "h-001",
      checkIn: futureDate(10),
      checkOut: futureDate(5),
      userId: testUser.id,
    });
  } catch (err) {
    console.log(`  ✗ Error caught: ${(err as Error).message}`);
  }
}

main().catch(console.error);
