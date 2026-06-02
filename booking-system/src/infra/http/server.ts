import "dotenv/config";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import cors from "@fastify/cors";
import { PrismaAccommodationRepository } from "../repositories/PrismaAccommodationRepository";
import { PrismaBookingRepository } from "../repositories/PrismaBookingRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { PricingService } from "../../application/services/PricingService";
import { CreateBooking } from "../../application/use-cases/CreateBooking";
import { PreviewBookingPrice } from "../../application/use-cases/PreviewBookingPrice";
import { RegisterUser } from "../../application/use-cases/RegisterUser";
import { LoginUser } from "../../application/use-cases/LoginUser";
import { PlatformFee, ServiceFee, LongStayDiscount } from "../../domain/fees/Fee";
import {
  DomainError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../domain/errors/DomainError";
import {
  validate,
  registerSchema,
  loginSchema,
  bookingSchema,
} from "./validation";
import { EventDispatcher } from "../../application/events/EventDispatcher";
import { ReservationEmailHandler } from "../../application/events/ReservationEmailHandler";
import { ReservationMetricsHandler } from "../../application/events/ReservationMetricsHandler";

const app = Fastify({ logger: true });

// ──────────────────────────────────────────────
// cors
// ──────────────────────────────────────────────
app.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

// ──────────────────────────────────────────────
// JWT
// ──────────────────────────────────────────────
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("FATAL: JWT_SECRET environment variable is not set.");
  process.exit(1);
}
app.register(fastifyJwt, { secret: jwtSecret });

// ──────────────────────────────────────────────
// Dependencies
// ──────────────────────────────────────────────
const accommodationRepo = new PrismaAccommodationRepository();
const bookingRepo = new PrismaBookingRepository();
const userRepo = new PrismaUserRepository();
const pricingService = new PricingService([new PlatformFee(), new ServiceFee(0.03), new LongStayDiscount()]);

const eventDispatcher = new EventDispatcher();
eventDispatcher.register("booking.created", new ReservationEmailHandler());
eventDispatcher.register("booking.created", new ReservationMetricsHandler());

const createBooking = new CreateBooking(accommodationRepo, pricingService, bookingRepo, eventDispatcher);
const previewPrice = new PreviewBookingPrice(accommodationRepo, pricingService);
const registerUser = new RegisterUser(userRepo);
const loginUser = new LoginUser(userRepo);

// ──────────────────────────────────────────────
// Auth middleware
// ──────────────────────────────────────────────
async function authenticate(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: "Unauthorized" });
  }
}

// ──────────────────────────────────────────────
// Auth routes
// ──────────────────────────────────────────────
app.post("/auth/register", { preHandler: [validate(registerSchema)] }, async (request, reply) => {
  const { name, email, password } = request.body as {
    name: string;
    email: string;
    password: string;
  };

  const user = await registerUser.execute({ name, email, password });
  reply.status(201);
  return user;
});

app.post("/auth/login", { preHandler: [validate(loginSchema)] }, async (request, reply) => {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  const user = await loginUser.execute({ email, password });
  const token = app.jwt.sign({ id: user.id, email: user.email });
  return { token, user };
});

// ──────────────────────────────────────────────
// Accommodation routes
// ──────────────────────────────────────────────
app.get("/accommodations", async () => {
  const all = await accommodationRepo.findAll();
  return all.map((a) => ({
    id:            a.id,
    name:          a.name,
    pricePerNight: a.pricePerNight,
    type:          a.type,
  }));
});

app.get("/accommodations/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  const accommodation = await accommodationRepo.findById(id);

  if (!accommodation) {
    reply.status(404);
    return { error: "Accommodation not found" };
  }

  return accommodation;
});

// ──────────────────────────────────────────────
// Booking routes
// ──────────────────────────────────────────────
app.post("/bookings/preview", { preHandler: [validate(bookingSchema)] }, async (request, reply) => {
  const { accommodationId, checkIn, checkOut } = request.body as {
    accommodationId: string;
    checkIn: string;
    checkOut: string;
  };

  const breakdown = await previewPrice.execute({
    accommodationId,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
  });

  return breakdown;
});

app.post("/bookings", { preHandler: [validate(bookingSchema), authenticate] }, async (request, reply) => {
  const user = request.user as { id: string };
  const { accommodationId, checkIn, checkOut } = request.body as {
    accommodationId: string;
    checkIn: string;
    checkOut: string;
  };

  const booking = await createBooking.execute({
    accommodationId,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    userId: user.id,
  });

  reply.status(201);
  return {
    id:          booking.id,
    checkIn:     booking.checkIn,
    checkOut:    booking.checkOut,
    days:        booking.days,
    basePrice:   booking.basePrice,
    totalPrice:  booking.totalPrice,
    userId:      booking.userId,
    accommodation: {
      id:   booking.accommodation.id,
      name: booking.accommodation.name,
    },
  };
});

app.get("/bookings", { preHandler: authenticate }, async (request) => {
  const user = request.user as { id: string };
  return bookingRepo.findByUserId(user.id);
});

app.get("/bookings/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const user = request.user as { id: string };
  const booking = await bookingRepo.findById(id);
  if (!booking) {
    reply.status(404);
    return { error: "Booking not found" };
  }
  if (booking.userId !== user.id) {
    reply.status(403);
    return { error: "Forbidden: this booking does not belong to you" };
  }
  return booking;
});

app.delete("/bookings/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const user = request.user as { id: string };
  const booking = await bookingRepo.findById(id);
  if (!booking) {
    reply.status(404);
    return { error: "Booking not found" };
  }
  if (booking.userId !== user.id) {
    reply.status(403);
    return { error: "Forbidden: this booking does not belong to you" };
  }
  await bookingRepo.delete(id);
  reply.status(204);
});

// ──────────────────────────────────────────────
// Error handler
// ──────────────────────────────────────────────
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ error: error.message });
  }
  if (error instanceof NotFoundError) {
    return reply.status(404).send({ error: error.message });
  }
  if (error instanceof ConflictError) {
    return reply.status(409).send({ error: error.message });
  }
  if (error instanceof ValidationError) {
    return reply.status(400).send({ error: error.message });
  }
  if (error instanceof DomainError) {
    return reply.status(400).send({ error: error.message });
  }

  reply.status(500).send({ error: "Internal server error" });
});

// ──────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────
app.listen({ port: 3001 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});