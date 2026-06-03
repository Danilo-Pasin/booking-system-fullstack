import type { FastifyInstance } from "fastify";
import { authenticate, requireHost } from "../middleware/auth.middleware";
import type { GetHostDashboard } from "../../../application/use-cases/GetHostDashboard";
import type { UserRepository } from "../../../domain/repositories/UserRepository";

export async function registerHostRoutes(
  app: FastifyInstance,
  deps: {
    userRepository: UserRepository;
    getHostDashboard: GetHostDashboard;
  },
) {
  app.get(
    "/host/dashboard",
    {
      preHandler: [authenticate, requireHost(deps.userRepository)],
      schema: {
        tags: ["Host"],
        summary: "Get host dashboard metrics",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Host dashboard data",
            type: "object",
            properties: {
              accommodationsCount: { type: "number" },
              bookingsCount: { type: "number" },
              estimatedRevenue: { type: "number" },
              pendingBookings: {
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
                },
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
}
