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
        summary: "Register a new user",
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8, description: "Must contain at least one letter and one number" },
            role: { type: "string", enum: ["GUEST", "HOST"], description: "Optional, defaults to GUEST" },
          },
        },
        response: {
          201: {
            description: "User created",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["GUEST", "HOST"] },
              avatarUrl: { type: "string" },
              bio: { type: "string" },
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
      reply.status(201);
      return user;
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
        summary: "Login",
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
            description: "Login successful",
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
                  avatarUrl: { type: "string" },
                  bio: { type: "string" },
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
      reply.setCookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
      return { token, user };
    },
  );

  app.put(
    "/auth/become-host",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Auth"],
        summary: "Upgrade current user to HOST",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Role upgraded to HOST",
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
                  avatarUrl: { type: "string" },
                  bio: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          409: {
            description: "Conflict — user is already a HOST",
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
      reply.setCookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: process.env.NODE_ENV === "production",
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
        summary: "Logout — clear auth cookie",
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
      return { message: "Logged out" };
    },
  );
}
