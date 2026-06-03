import type { FastifyInstance } from "fastify";
import { validate, bookingSchema } from "../validation";
import { authenticate, requireHost } from "../middleware/auth.middleware";
import type { CreateBooking } from "../../../application/use-cases/CreateBooking";
import type { PreviewBookingPrice } from "../../../application/use-cases/PreviewBookingPrice";
import type { CancelBooking } from "../../../application/use-cases/CancelBooking";
import type { ListUserBookings } from "../../../application/use-cases/ListUserBookings";
import type { GetBookingById } from "../../../application/use-cases/GetBookingById";
import type { UpdateBookingStatus } from "../../../application/use-cases/UpdateBookingStatus";
import type { UserRepository } from "../../../domain/repositories/UserRepository";

export async function registerBookingRoutes(
  app: FastifyInstance,
  deps: {
    createBooking: CreateBooking;
    previewPrice: PreviewBookingPrice;
    cancelBooking: CancelBooking;
    listUserBookings: ListUserBookings;
    getBookingById: GetBookingById;
    updateBookingStatus?: UpdateBookingStatus;
    userRepository?: UserRepository;
  },
) {
  app.post(
    "/bookings/preview",
    {
      preHandler: [validate(bookingSchema)],
      schema: {
        tags: ["Bookings"],
        summary: "Preview booking price",
        body: {
          type: "object",
          required: ["accommodationId", "checkIn", "checkOut"],
          properties: {
            accommodationId: { type: "string" },
            checkIn: { type: "string", format: "date" },
            checkOut: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            description: "Price breakdown",
            type: "object",
            properties: {
              base: { type: "number" },
              fees: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    amount: { type: "number" },
                  },
                },
              },
              total: { type: "number" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { accommodationId, checkIn, checkOut } = request.body as {
        accommodationId: string;
        checkIn: string;
        checkOut: string;
      };
      const breakdown = await deps.previewPrice.execute({
        accommodationId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
      });
      return breakdown;
    },
  );

  app.post(
    "/bookings",
    {
      preHandler: [validate(bookingSchema), authenticate],
      schema: {
        tags: ["Bookings"],
        summary: "Create a booking",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["accommodationId", "checkIn", "checkOut"],
          properties: {
            accommodationId: { type: "string" },
            checkIn: { type: "string", format: "date" },
            checkOut: { type: "string", format: "date" },
          },
        },
        response: {
          201: {
            description: "Booking created",
            type: "object",
            properties: {
              id: { type: "string" },
              checkIn: { type: "string", format: "date-time" },
              checkOut: { type: "string", format: "date-time" },
              days: { type: "integer" },
              basePrice: { type: "number" },
              totalPrice: { type: "number" },
              userId: { type: "string" },
              accommodation: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user as { id: string };
      const { accommodationId, checkIn, checkOut } = request.body as {
        accommodationId: string;
        checkIn: string;
        checkOut: string;
      };
      const booking = await deps.createBooking.execute({
        accommodationId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        userId: user.id,
      });
      reply.status(201);
      return {
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        days: booking.days,
        basePrice: booking.basePrice,
        totalPrice: booking.totalPrice,
        userId: booking.userId,
        accommodation: {
          id: booking.accommodation.id,
          name: booking.accommodation.name,
        },
      };
    },
  );

  app.get(
    "/bookings",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Bookings"],
        summary: "List user bookings",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "User bookings",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                checkIn: { type: "string", format: "date-time" },
                checkOut: { type: "string", format: "date-time" },
                basePrice: { type: "number" },
                totalPrice: { type: "number" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                userId: { type: "string" },
                userName: { type: "string" },
                accommodation: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string" },
                    pricePerNight: { type: "number" },
                    description: { type: "string" },
                    imageUrl: { type: "string" },
                    ownerId: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const user = request.user as { id: string };
      const bookings = await deps.listUserBookings.execute({ userId: user.id });
      return bookings.map((b: any) => ({
        id: b.id,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        basePrice: b.basePrice,
        totalPrice: b.totalPrice,
        status: b.status,
        createdAt: b.createdAt,
        userId: b.userId,
        userName: b.userName,
        accommodation: {
          id: b.accommodation.id,
          name: b.accommodation.name,
          type: b.accommodation.type,
          pricePerNight: b.accommodation.pricePerNight,
          description: b.accommodation.description,
          imageUrl: b.accommodation.imageUrl,
          ownerId: b.accommodation.ownerId,
        },
      }));
    },
  );

  app.get(
    "/bookings/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Bookings"],
        summary: "Get booking by ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        response: {
          200: {
            description: "Booking details",
            type: "object",
            properties: {
              id: { type: "string" },
              checkIn: { type: "string", format: "date-time" },
              checkOut: { type: "string", format: "date-time" },
              basePrice: { type: "number" },
              totalPrice: { type: "number" },
              createdAt: { type: "string", format: "date-time" },
              userId: { type: "string" },
              accommodation: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  type: { type: "string" },
                },
              },
            },
          },
          404: {
            description: "Not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
          403: {
            description: "Forbidden",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request) => {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string };
      return deps.getBookingById.execute({ bookingId: id, userId: user.id });
    },
  );

  app.delete(
    "/bookings/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Bookings"],
        summary: "Cancel a booking",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        response: {
          200: {
            description: "Booking cancelled",
            type: "object",
            properties: {
              id: { type: "string" },
              status: { type: "string" },
              checkIn: { type: "string", format: "date-time" },
              checkOut: { type: "string", format: "date-time" },
              basePrice: { type: "number" },
              totalPrice: { type: "number" },
              userId: { type: "string" },
              accommodation: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  type: { type: "string" },
                },
              },
            },
          },
          404: {
            description: "Not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
          403: {
            description: "Forbidden",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request) => {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string };
      return deps.cancelBooking.execute({ id, userId: user.id });
    },
  );

  if (deps.updateBookingStatus && deps.userRepository) {
    app.patch(
      "/bookings/:id/status",
      {
        preHandler: [authenticate, requireHost(deps.userRepository)],
        schema: {
          tags: ["Bookings"],
          summary: "Approve or reject a booking (host only)",
          security: [{ bearerAuth: [] }],
          params: {
            type: "object",
            required: ["id"],
            properties: { id: { type: "string" } },
          },
          body: {
            type: "object",
            required: ["status"],
            properties: {
              status: { type: "string", enum: ["APPROVED", "REJECTED"] },
            },
          },
          response: {
            200: {
              description: "Booking status updated",
              type: "object",
              properties: {
                id: { type: "string" },
                status: { type: "string" },
                checkIn: { type: "string", format: "date-time" },
                checkOut: { type: "string", format: "date-time" },
                basePrice: { type: "number" },
                totalPrice: { type: "number" },
                userId: { type: "string" },
                accommodation: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      async (request) => {
        const { id } = request.params as { id: string };
        const { status } = request.body as { status: string };
        const user = request.user as { id: string };
        return deps.updateBookingStatus!.execute({ bookingId: id, status, userId: user.id });
      },
    );
  }
}
