import type { FastifyInstance } from "fastify";
import { authenticate, requireHost } from "../middleware/auth.middleware";
import type { GetHostDashboard } from "../../../application/use-cases/GetHostDashboard";
import type { ListHostBookings } from "../../../application/use-cases/ListHostBookings";
import type { UserRepository } from "../../../domain/repositories/UserRepository";

const bookingSummaryProps = {
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
    userEmail: { type: "string" },
    accommodation: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        type: { type: "string" },
        ownerId: { type: "string" },
      },
    },
  },
};

export async function registerHostRoutes(
  app: FastifyInstance,
  deps: {
    userRepository: UserRepository;
    getHostDashboard: GetHostDashboard;
    listHostBookings: ListHostBookings;
  },
) {
  app.get(
    "/host/dashboard",
    {
      preHandler: [authenticate, requireHost(deps.userRepository)],
      schema: {
        tags: ["Host"],
        summary: "Obter métricas do dashboard do anfitrião",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Dados do dashboard do anfitrião",
            type: "object",
            properties: {
              accommodationsCount: { type: "number" },
              bookingsCount: { type: "number" },
              estimatedRevenue: { type: "number" },
              pendingBookings: {
                type: "array",
                items: bookingSummaryProps,
              },
            },
          },
        },
      },
    },
    async (request) => {
      const user = request.user as { id: string };
      return deps.getHostDashboard.execute({ ownerId: user.id });
    },
  );

  app.get(
    "/host/bookings",
    {
      preHandler: [authenticate, requireHost(deps.userRepository)],
      schema: {
        tags: ["Host"],
        summary: "Listar todas as reservas das acomodações do anfitrião",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Lista de reservas do anfitrião",
            type: "array",
            items: bookingSummaryProps,
          },
        },
      },
    },
    async (request) => {
      const user = request.user as { id: string };
      return deps.listHostBookings.execute({ ownerId: user.id });
    },
  );
}
