import type { FastifyInstance } from "fastify";
import { validate, updateProfileSchema } from "../validation";
import { authenticate } from "../middleware/auth.middleware";
import type { GetCurrentUser } from "../../../application/use-cases/GetCurrentUser";
import type { UpdateProfile } from "../../../application/use-cases/UpdateProfile";
import type { GetPublicProfile } from "../../../application/use-cases/GetPublicProfile";

export async function registerProfileRoutes(
  app: FastifyInstance,
  deps: {
    getCurrentUser: GetCurrentUser;
    updateProfile: UpdateProfile;
    getPublicProfile: GetPublicProfile;
  },
) {
  app.get(
    "/auth/me",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Current user profile",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["GUEST", "HOST"] },
              avatarUrl: { type: "string" },
              bio: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    async (request) => {
      const user = request.user as { id: string };
      const result = await deps.getCurrentUser.execute({ userId: user.id });
      return result;
    },
  );

  app.put(
    "/auth/me",
    {
      preHandler: [authenticate, validate(updateProfileSchema)],
      schema: {
        tags: ["Auth"],
        summary: "Update current user profile",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 2 },
            avatarUrl: { type: "string" },
            bio: { type: "string", maxLength: 500 },
            currentPassword: { type: "string", description: "Obrigatória se newPassword for informada" },
            newPassword: { type: "string", minLength: 8, description: "Deve conter pelo menos uma letra e um número" },
          },
        },
        response: {
          200: {
            description: "Updated user profile",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["GUEST", "HOST"] },
              avatarUrl: { type: "string" },
              bio: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    async (request) => {
      const user = request.user as { id: string };
      const { name, avatarUrl, bio, currentPassword, newPassword } = request.body as {
        name?: string;
        avatarUrl?: string;
        bio?: string;
        currentPassword?: string;
        newPassword?: string;
      };
      return deps.updateProfile.execute({ userId: user.id, name, avatarUrl, bio, currentPassword, newPassword });
    },
  );

  app.get(
    "/users/:id",
    {
      schema: {
        tags: ["Users"],
        summary: "Get public user profile",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        response: {
          200: {
            description: "Public user profile",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              role: { type: "string", enum: ["GUEST", "HOST"] },
              avatarUrl: { type: "string" },
              bio: { type: "string" },
              accommodationCount: { type: "number" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          404: {
            description: "User not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return deps.getPublicProfile.execute({ userId: id });
    },
  );
}
