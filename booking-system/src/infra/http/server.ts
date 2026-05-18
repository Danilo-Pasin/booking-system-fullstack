import "dotenv/config";
import Fastify, { FastifyError } from "fastify";
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
import { PlatformFee, ServiceFee } from "../../domain/fees/Fee";

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
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET ?? "supersecret",
});

// ──────────────────────────────────────────────
// Dependencies
// ──────────────────────────────────────────────
const accommodationRepo = new PrismaAccommodationRepository();
const bookingRepo = new PrismaBookingRepository();
const userRepo = new PrismaUserRepository();
const pricingService = new PricingService([new PlatformFee(), new ServiceFee(0.03)]);
const createBooking = new CreateBooking(accommodationRepo, pricingService, bookingRepo);
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
app.post("/auth/register", async (request, reply) => {
  const { name, email, password } = request.body as {
    name: string;
    email: string;
    password: string;
  };

  const user = await registerUser.execute({ name, email, password });
  reply.status(201);
  return user;
});

app.post("/auth/login", async (request, reply) => {
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
app.post("/bookings/preview", async (request, reply) => {
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

app.post("/bookings", { preHandler: authenticate }, async (request, reply) => {
  const { accommodationId, checkIn, checkOut } = request.body as {
    accommodationId: string;
    checkIn: string;
    checkOut: string;
  };

  const booking = await createBooking.execute({
    accommodationId,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
  });

  reply.status(201);
  return {
    id:          booking.id,
    checkIn:     booking.checkIn,
    checkOut:    booking.checkOut,
    days:        booking.days,
    basePrice:   booking.basePrice,
    totalPrice:  booking.totalPrice,
    accommodation: {
      id:   booking.accommodation.id,
      name: booking.accommodation.name,
    },
  };
});

app.get("/bookings", { preHandler: authenticate }, async () => {
  return bookingRepo.findAll();
});

app.get("/bookings/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const booking = await bookingRepo.findById(id);
  if (!booking) {
    reply.status(404);
    return { error: "Booking not found" };
  }
  return booking;
});

app.delete("/bookings/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const booking = await bookingRepo.findById(id);
  if (!booking) {
    reply.status(404);
    return { error: "Booking not found" };
  }
  await bookingRepo.delete(id);
  reply.status(204);
});

// ──────────────────────────────────────────────
// Error handler
// ──────────────────────────────────────────────
app.setErrorHandler((error: FastifyError, request, reply) => {
  reply.status(400).send({ error: error.message });
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