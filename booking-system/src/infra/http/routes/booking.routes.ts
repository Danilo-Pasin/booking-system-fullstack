import type { FastifyInstance } from "fastify";
import { validate, bookingSchema } from "../validation";
import { authenticate, requireHost } from "../middleware/auth.middleware";
import type { CreateBooking } from "../../../application/use-cases/CreateBooking";
import type { PreviewBookingPrice } from "../../../application/use-cases/PreviewBookingPrice";
import type { CancelBooking } from "../../../application/use-cases/CancelBooking";
import type { ListUserBookings } from "../../../application/use-cases/ListUserBookings";
import type { GetBookingById } from "../../../application/use-cases/GetBookingById";
import type { UpdateBookingStatus } from "../../../application/use-cases/UpdateBookingStatus";
import type { HostCancelBooking } from "../../../application/use-cases/HostCancelBooking";
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
    hostCancelBooking?: HostCancelBooking;
    userRepository?: UserRepository;
  },
) {
  app.post(
    "/bookings/preview",
    {
      preHandler: [validate(bookingSchema)],
      schema: {
        tags: ["Bookings"],
        summary: "Visualizar preço da reserva",
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
             description: "Detalhamento de preços",
            type: "object",
            properties: {
              days: { type: "integer" },
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
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "1 minute",
        },
      },
      preHandler: [validate(bookingSchema), authenticate],
      schema: {
        tags: ["Bookings"],
        summary: "Criar uma reserva",
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
             description: "Reserva criada",
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
        summary: "Listar reservas do usuário",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "Status separados por vírgula para filtrar (ex: PENDING,APPROVED)",
            },
          },
        },
        response: {
          200: {
             description: "Reservas do usuário",
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
      const query = request.query as { status?: string };
      const statuses = query.status
        ? (query.status.split(",") as any[])
        : undefined;
      const bookings = await deps.listUserBookings.execute({ userId: user.id, statuses });
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
        summary: "Obter reserva por ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        response: {
          200: {
             description: "Detalhes da reserva",
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
             description: "Não encontrada",
             type: "object",
             properties: { error: { type: "string" } },
           },
           403: {
             description: "Proibido",
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
        summary: "Cancelar uma reserva",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        response: {
          200: {
             description: "Reserva cancelada",
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
             description: "Não encontrada",
             type: "object",
             properties: { error: { type: "string" } },
           },
           403: {
             description: "Proibido",
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
          summary: "Aprovar ou rejeitar reserva (apenas host)",
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
               description: "Status da reserva atualizado",
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

  if (deps.hostCancelBooking && deps.userRepository) {
    app.patch(
      "/bookings/:id/cancel",
      {
        preHandler: [authenticate, requireHost(deps.userRepository)],
        schema: {
          tags: ["Bookings"],
          summary: "Cancelar reserva (apenas host)",
          security: [{ bearerAuth: [] }],
          params: {
            type: "object",
            required: ["id"],
            properties: { id: { type: "string" } },
          },
          response: {
            200: {
               description: "Reserva cancelada",
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
        const user = request.user as { id: string };
        return deps.hostCancelBooking!.execute({ bookingId: id, userId: user.id });
      },
    );
  }
}
