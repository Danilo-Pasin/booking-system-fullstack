import type { FastifyInstance } from "fastify";
import { validate, createAccommodationSchema, updateAccommodationSchema, accommodationResponseSchema, imageResponseSchema } from "../validation";
import { authenticate, requireHost } from "../middleware/auth.middleware";
import type { CreateAccommodation } from "../../../application/use-cases/CreateAccommodation";
import type { UpdateAccommodation } from "../../../application/use-cases/UpdateAccommodation";
import type { DeleteAccommodation } from "../../../application/use-cases/DeleteAccommodation";
import type { GetAccommodationById } from "../../../application/use-cases/GetAccommodationById";
import type { ListAccommodations } from "../../../application/use-cases/ListAccommodations";
import type { ListMyAccommodations } from "../../../application/use-cases/ListMyAccommodations";
import type { UserRepository } from "../../../domain/repositories/UserRepository";

export async function registerAccommodationRoutes(
  app: FastifyInstance,
  deps: {
    userRepository: UserRepository;
    createAccommodation: CreateAccommodation;
    updateAccommodation: UpdateAccommodation;
    deleteAccommodation: DeleteAccommodation;
    getAccommodationById: GetAccommodationById;
    listAccommodations: ListAccommodations;
    listMyAccommodations: ListMyAccommodations;
  },
) {
  // Public — list all with optional search/filter/sort
  app.get("/accommodations", {
    schema: {
      tags: ["Accommodations"],
      summary: "List all accommodations",
      querystring: {
        type: "object",
        properties: {
          search: { type: "string", maxLength: 100 },
          type: { type: "string", enum: ["house", "apartment", "shared_room"] },
          sort: { type: "string", enum: ["price_asc", "price_desc", "name_asc"] },
        },
      },
      response: {
        200: {
          description: "List of accommodations",
          type: "array",
          items: accommodationResponseSchema,
        },
      },
    },
  }, async (request) => {
    const { search, type, sort } = request.query as {
      search?: string;
      type?: "house" | "apartment" | "shared_room";
      sort?: "price_asc" | "price_desc" | "name_asc";
    };
    const all = await deps.listAccommodations.execute({ search, type, sort });
    return all.map((a: any) => ({
      id: a.id,
      name: a.name,
      pricePerNight: a.pricePerNight,
      type: a.type,
      imageUrl: a.imageUrl,
      description: a.description,
      ownerId: a.ownerId,
      images: a.images,
    }));
  });

  app.get(
    "/accommodations/:id",
    {
      schema: {
        tags: ["Accommodations"],
        summary: "Get accommodation by ID",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        response: {
          200: {
            description: "Accommodation details",
            ...accommodationResponseSchema,
          },
          404: {
            description: "Not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      return deps.getAccommodationById.execute({ id });
    },
  );

  // Host only
  app.post(
    "/accommodations",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
        },
      },
      preHandler: [authenticate, validate(createAccommodationSchema), requireHost(deps.userRepository)],
      schema: {
        tags: ["Accommodations (Host)"],
        summary: "Create a new accommodation",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name", "type", "pricePerNight"],
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            pricePerNight: { type: "number" },
            description: { type: "string" },
            imageUrl: { type: "string" },
            images: { type: "array", items: { type: "string" } },
          },
        },
        response: {
          201: {
            description: "Accommodation created",
            ...accommodationResponseSchema,
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user as { id: string };
      const { name, type, pricePerNight, description, imageUrl, images } = request.body as {
        name: string;
        type: string;
        pricePerNight: number;
        description?: string;
        imageUrl?: string;
        images?: string[];
      };
      const accommodation = await deps.createAccommodation.execute({
        name, type, pricePerNight, description, imageUrl, images, ownerId: user.id,
      });
      reply.status(201);
      return accommodation;
    },
  );

  app.get(
    "/accommodations/mine",
    {
      preHandler: [authenticate, requireHost(deps.userRepository)],
      schema: {
        tags: ["Accommodations (Host)"],
        summary: "List my accommodations",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of host's accommodations",
            type: "array",
            items: accommodationResponseSchema,
          },
        },
      },
    },
    async (request) => {
      const user = request.user as { id: string };
      return deps.listMyAccommodations.execute({ ownerId: user.id });
    },
  );

  app.put(
    "/accommodations/:id",
    {
      preHandler: [authenticate, validate(updateAccommodationSchema), requireHost(deps.userRepository)],
      schema: {
        tags: ["Accommodations (Host)"],
        summary: "Update an accommodation",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            pricePerNight: { type: "number" },
            description: { type: "string" },
            imageUrl: { type: "string" },
            images: { type: "array", items: { type: "string" } },
          },
        },
        response: {
          200: {
            description: "Accommodation updated",
            ...accommodationResponseSchema,
          },
          403: {
            description: "Forbidden",
            type: "object",
            properties: { error: { type: "string" } },
          },
          404: {
            description: "Not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string };
      const body = request.body as {
        name?: string;
        pricePerNight?: number;
        description?: string;
        imageUrl?: string;
        images?: string[];
      };
      const updated = await deps.updateAccommodation.execute({
        id, ownerId: user.id,
        name: body.name,
        pricePerNight: body.pricePerNight,
        description: body.description,
        imageUrl: body.imageUrl,
        images: body.images,
      });
      return updated;
    },
  );

  app.delete(
    "/accommodations/:id",
    {
      preHandler: [authenticate, requireHost(deps.userRepository)],
      schema: {
        tags: ["Accommodations (Host)"],
        summary: "Delete an accommodation",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        response: {
          204: {
            description: "Accommodation deleted, no content",
            type: "null",
          },
          403: {
            description: "Forbidden",
            type: "object",
            properties: { error: { type: "string" } },
          },
          404: {
            description: "Not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string };
      await deps.deleteAccommodation.execute({ id, ownerId: user.id });
      reply.status(204);
    },
  );
}
