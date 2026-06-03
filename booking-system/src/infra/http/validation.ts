import { z } from "zod";
import type { FastifyRequest } from "fastify";
import { ValidationError } from "../../domain/errors/DomainError";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .max(128, "A senha deve ter no máximo 128 caracteres")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const bookingSchema = z.object({
  accommodationId: z.string().min(1, "accommodationId is required"),
  checkIn: z.string().date("checkIn must be a valid date (YYYY-MM-DD)"),
  checkOut: z.string().date("checkOut must be a valid date (YYYY-MM-DD)"),
});

export const createAccommodationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["house", "apartment", "shared_room"], "Type must be one of: house, apartment, shared_room"),
  pricePerNight: z.number().positive("pricePerNight must be a positive number"),
  description: z.string().optional(),
  imageUrl: z.string().url("imageUrl must be a valid URL").optional(),
  images: z.array(z.string().url()).max(10, "Maximum of 10 images").optional(),
});

export const updateAccommodationSchema = z.object({
  name: z.string().min(1).optional(),
  pricePerNight: z.number().positive("pricePerNight must be a positive number").optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("imageUrl must be a valid URL").optional(),
  images: z.array(z.string().url()).max(10, "Maximum of 10 images").optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters").optional(),
  avatarUrl: z.string().url("avatarUrl must be a valid URL").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must have at most 500 characters").optional(),
});

export const imageResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    url: { type: "string" },
    order: { type: "number" },
  },
};

export const accommodationResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    pricePerNight: { type: "number" },
    type: { type: "string", enum: ["house", "apartment", "shared_room"] },
    imageUrl: { type: "string" },
    description: { type: "string" },
    ownerId: { type: "string" },
    images: {
      type: "array",
      items: imageResponseSchema,
    },
  },
};

export function validate(schema: z.ZodSchema) {
  return async (request: FastifyRequest) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      const messages = result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      );
      throw new ValidationError(messages.join("; "));
    }
  };
}
