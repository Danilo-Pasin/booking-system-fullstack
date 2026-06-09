import type { FastifyInstance } from "fastify";
import { validate, registerSchema, loginSchema } from "../validation";
import { authenticate } from "../middleware/auth.middleware";
import type { RegisterUser } from "../../../application/use-cases/RegisterUser";
import type { LoginUser } from "../../../application/use-cases/LoginUser";
import type { UpgradeToHost } from "../../../application/use-cases/UpgradeToHost";

export async function registerAuthRoutes(
  app: FastifyInstance,
  deps: {
    registerUser: RegisterUser;
    loginUser: LoginUser;
    upgradeToHost: UpgradeToHost;
  },
) {
  app.post(
    "/auth/register",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
      preHandler: [validate(registerSchema)],
      schema: {
        tags: ["Auth"],
        summary: "Registrar um novo usuário",
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8, description: "Deve conter ao menos uma letra e um número" },
            role: { type: "string", enum: ["GUEST", "HOST"], description: "Opcional, padrão é GUEST" },
          },
        },
        response: {
          201: {
             description: "Usuário criado",
            type: "object",
            properties: {
              token: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string", enum: ["GUEST", "HOST"] },
                  avatarUrl: { type: "string", nullable: true },
                  bio: { type: "string", nullable: true },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, email, password, role } = request.body as {
        name: string;
        email: string;
        password: string;
        role?: "GUEST" | "HOST";
      };
      const user = await deps.registerUser.execute({ name, email, password, role });
      const token = app.jwt.sign(
        { id: user.id, role: user.role },
        { expiresIn: "24h" },
      );
      const isProduction = process.env.NODE_ENV === "production";
      reply.setCookie("token", token, {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        secure: isProduction,
      });
      reply.status(201);
      return { token, user };
    },
  );

  app.post(
    "/auth/login",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
      preHandler: [validate(loginSchema)],
      schema: {
        tags: ["Auth"],
        summary: "Fazer login",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        response: {
          200: {
             description: "Login realizado com sucesso",
            type: "object",
            properties: {
              token: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string", enum: ["GUEST", "HOST"] },
                  avatarUrl: { type: "string", nullable: true },
                  bio: { type: "string", nullable: true },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string };
      const user = await deps.loginUser.execute({ email, password });
      const token = app.jwt.sign(
        { id: user.id, role: user.role },
        { expiresIn: "24h" },
      );
      const isProduction = process.env.NODE_ENV === "production";
      reply.setCookie("token", token, {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        secure: isProduction,
      });
      return { token, user };
    },
  );

  app.put(
    "/auth/become-host",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
      preHandler: authenticate,
      schema: {
        tags: ["Auth"],
        summary: "Elevar usuário atual para HOST",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
             description: "Papel elevado para HOST",
            type: "object",
            properties: {
              token: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string", enum: ["HOST"] },
                  avatarUrl: { type: "string", nullable: true },
                  bio: { type: "string", nullable: true },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          409: {
             description: "Conflito — usuário já é HOST",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const currentUser = request.user as { id: string };
      const updatedUser = await deps.upgradeToHost.execute({ userId: currentUser.id });
      const token = app.jwt.sign(
        { id: updatedUser.id, role: "HOST" },
        { expiresIn: "24h" },
      );
      const isProduction = process.env.NODE_ENV === "production";
      reply.setCookie("token", token, {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        secure: isProduction,
      });
      return { token, user: updatedUser };
    },
  );

  app.post(
    "/auth/logout",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Auth"],
        summary: "Sair — limpar cookie de autenticação",
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      reply.clearCookie("token", { path: "/" });
      return { message: "Desconectado" };
    },
  );
}
