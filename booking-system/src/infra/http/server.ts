import "dotenv/config";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import { CloudinaryStorage } from "../storage/CloudinaryStorage";
import { UploadImage } from "../../application/use-cases/UploadImage";
import { PrismaAccommodationRepository } from "../repositories/PrismaAccommodationRepository";
import { PrismaBookingRepository } from "../repositories/PrismaBookingRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { PricingService } from "../../application/services/PricingService";
import { CreateBooking } from "../../application/use-cases/CreateBooking";
import { PreviewBookingPrice } from "../../application/use-cases/PreviewBookingPrice";
import { RegisterUser } from "../../application/use-cases/RegisterUser";
import { LoginUser } from "../../application/use-cases/LoginUser";
import { CreateAccommodation } from "../../application/use-cases/CreateAccommodation";
import { UpdateAccommodation } from "../../application/use-cases/UpdateAccommodation";
import { DeleteAccommodation } from "../../application/use-cases/DeleteAccommodation";
import { GetCurrentUser } from "../../application/use-cases/GetCurrentUser";
import { UpdateProfile } from "../../application/use-cases/UpdateProfile";
import { GetPublicProfile } from "../../application/use-cases/GetPublicProfile";
import { GetAccommodationById } from "../../application/use-cases/GetAccommodationById";
import { ListAccommodations } from "../../application/use-cases/ListAccommodations";
import { ListMyAccommodations } from "../../application/use-cases/ListMyAccommodations";
import { CancelBooking } from "../../application/use-cases/CancelBooking";
import { ListUserBookings } from "../../application/use-cases/ListUserBookings";
import { GetBookingById } from "../../application/use-cases/GetBookingById";
import { UpdateBookingStatus } from "../../application/use-cases/UpdateBookingStatus";
import { UpgradeToHost } from "../../application/use-cases/UpgradeToHost";
import { GetHostDashboard } from "../../application/use-cases/GetHostDashboard";
import { ListHostBookings } from "../../application/use-cases/ListHostBookings";
import { PlatformFee, ServiceFee, LongStayDiscount } from "../../domain/fees/Fee";
import {
  DomainError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../domain/errors/DomainError";
import { EventDispatcher } from "../../application/events/EventDispatcher";
import { ReservationEmailHandler } from "../../application/events/ReservationEmailHandler";
import { ReservationMetricsHandler } from "../../application/events/ReservationMetricsHandler";
import { registerAuthRoutes } from "./routes/auth.routes";
import { registerProfileRoutes } from "./routes/profile.routes";
import { registerAccommodationRoutes } from "./routes/accommodation.routes";
import { registerBookingRoutes } from "./routes/booking.routes";
import { registerHostRoutes } from "./routes/host.routes";
import { registerUploadRoutes } from "./routes/upload.routes";

async function start() {
const app = Fastify({ logger: true });

// ──────────────────────────────────────────────
// Plugins
// ──────────────────────────────────────────────
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? (process.env.NODE_ENV === "production"
    ? "https://your-production-url.com"
    : "http://localhost:3000"),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
});

await app.register(cookie);

await app.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 },
});

await app.register(rateLimit, {
  max: 1000,
  timeWindow: "1 minute",
});

await app.register(helmet);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Booking System API",
      description:
        "Fullstack booking system — Academic project demonstrating Clean Architecture, SOLID principles, and OOP design patterns.",
      version: "1.0.1",
    },
    servers: [{ url: "http://localhost:3001", description: "Development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
}

// ──────────────────────────────────────────────
// Cloudinary config
// ──────────────────────────────────────────────
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error("FATAL: CLOUDINARY_CLOUD_NAME environment variable is not set.");
  process.exit(1);
}
if (!process.env.CLOUDINARY_API_KEY) {
  console.error("FATAL: CLOUDINARY_API_KEY environment variable is not set.");
  process.exit(1);
}
if (!process.env.CLOUDINARY_API_SECRET) {
  console.error("FATAL: CLOUDINARY_API_SECRET environment variable is not set.");
  process.exit(1);
}

// JWT
// ──────────────────────────────────────────────
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("FATAL: JWT_SECRET environment variable is not set.");
  process.exit(1);
}
await app.register(fastifyJwt, {
  secret: jwtSecret,
  cookie: { cookieName: "token", signed: false },
});

// ──────────────────────────────────────────────
// Dependencies
// ──────────────────────────────────────────────
const accommodationRepo = new PrismaAccommodationRepository();
const bookingRepo = new PrismaBookingRepository();
const userRepo = new PrismaUserRepository();
const pricingService = new PricingService([
  new PlatformFee(),
  new ServiceFee(0.03),
  new LongStayDiscount(),
]);

const eventDispatcher = new EventDispatcher();
eventDispatcher.register("booking.created", new ReservationEmailHandler());
eventDispatcher.register("booking.created", new ReservationMetricsHandler());

const registerUser = new RegisterUser(userRepo);
const loginUser = new LoginUser(userRepo);
const createAccommodation = new CreateAccommodation(accommodationRepo);
const updateAccommodation = new UpdateAccommodation(accommodationRepo);
const deleteAccommodation = new DeleteAccommodation(accommodationRepo);
const getCurrentUser = new GetCurrentUser(userRepo);
const updateProfile = new UpdateProfile(userRepo);
const getPublicProfile = new GetPublicProfile(userRepo, accommodationRepo);
const getAccommodationById = new GetAccommodationById(accommodationRepo);
const listAccommodations = new ListAccommodations(accommodationRepo);
const listMyAccommodations = new ListMyAccommodations(accommodationRepo);
const createBooking = new CreateBooking(accommodationRepo, pricingService, bookingRepo, eventDispatcher);
const previewPrice = new PreviewBookingPrice(accommodationRepo, pricingService);
const cancelBooking = new CancelBooking(bookingRepo);
const listUserBookings = new ListUserBookings(bookingRepo);
const getBookingById = new GetBookingById(bookingRepo);
const upgradeToHost = new UpgradeToHost(userRepo);
const updateBookingStatus = new UpdateBookingStatus(bookingRepo);
const getHostDashboard = new GetHostDashboard(accommodationRepo, bookingRepo);
const listHostBookings = new ListHostBookings(bookingRepo);
const cloudinaryStorage = new CloudinaryStorage();
const uploadImage = new UploadImage(cloudinaryStorage);

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
await registerAuthRoutes(app, { registerUser, loginUser, upgradeToHost });
await registerProfileRoutes(app, { getCurrentUser, updateProfile, getPublicProfile });
await registerAccommodationRoutes(app, {
  userRepository: userRepo,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodationById,
  listAccommodations,
  listMyAccommodations,
});
await registerBookingRoutes(app, {
  createBooking,
  previewPrice,
  cancelBooking,
  listUserBookings,
  getBookingById,
  updateBookingStatus,
  userRepository: userRepo,
});

await registerHostRoutes(app, { userRepository: userRepo, getHostDashboard, listHostBookings });
await registerUploadRoutes(app, { uploadImage });

// ──────────────────────────────────────────────
// Error handler
// ──────────────────────────────────────────────
app.setErrorHandler((error, _request, reply) => {
  const err = error as any;

  if (err.statusCode && typeof err.statusCode === "number") {
    return reply.status(err.statusCode).send({ error: err.message });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ error: error.message });
  }
  if (error instanceof ForbiddenError) {
    return reply.status(403).send({ error: error.message });
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

  console.error("=== UNHANDLED ERROR ===");
  console.error("Name:", err.constructor?.name ?? typeof err);
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  if (err.code) console.error("Code:", err.code);
  reply.status(500).send({ error: "Internal server error" });
});

// ──────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────
try {
  await app.listen({ port: 3001 });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
}

start();
