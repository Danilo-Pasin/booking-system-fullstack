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
        summary: "Obter perfil do usuário atual",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Perfil do usuário atual",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["GUEST", "HOST"] },
              avatarUrl: { type: "string", nullable: true },
              bio: { type: "string", nullable: true },
              images: {
                type: "array",
                items: { type: "object", properties: { id: { type: "string" }, url: { type: "string" }, order: { type: "number" }, isPrimary: { type: "boolean" } } },
              },
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
        summary: "Atualizar perfil do usuário atual",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 2 },
            avatarUrl: { type: "string", nullable: true },
            bio: { type: "string", maxLength: 500 },
            images: { type: "array", items: { type: "string" }, description: "Array de URLs de imagens" },
            currentPassword: { type: "string", description: "Obrigatória se newPassword for informada" },
            newPassword: { type: "string", minLength: 8, description: "Deve conter pelo menos uma letra e um número" },
          },
        },
        response: {
          200: {
            description: "Perfil do usuário atualizado",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["GUEST", "HOST"] },
              avatarUrl: { type: "string", nullable: true },
              bio: { type: "string", nullable: true },
              images: {
                type: "array",
                items: { type: "object", properties: { id: { type: "string" }, url: { type: "string" }, order: { type: "number" }, isPrimary: { type: "boolean" } } },
              },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    async (request) => {
      const user = request.user as { id: string };
      const { name, avatarUrl, bio, images, currentPassword, newPassword } = request.body as {
        name?: string;
        avatarUrl?: string;
        bio?: string;
        images?: string[];
        currentPassword?: string;
        newPassword?: string;
      };
      return deps.updateProfile.execute({ userId: user.id, name, avatarUrl, bio, images, currentPassword, newPassword });
    },
  );

  app.get(
    "/users/:id",
    {
      schema: {
        tags: ["Users"],
        summary: "Obter perfil público do usuário",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        response: {
          200: {
            description: "Perfil público do usuário",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              role: { type: "string", enum: ["GUEST", "HOST"] },
              avatarUrl: { type: "string", nullable: true },
              bio: { type: "string", nullable: true },
              images: {
                type: "array",
                items: { type: "object", properties: { id: { type: "string" }, url: { type: "string" }, order: { type: "number" }, isPrimary: { type: "boolean" } } },
              },
              accommodationCount: { type: "number" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          404: {
            description: "Usuário não encontrado",
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
