import { z } from "zod";
import type { FastifyRequest } from "fastify";
import { ValidationError } from "../../domain/errors/DomainError";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must have at least 6 characters"),
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

type SchemaMap = {
  "/auth/register": typeof registerSchema;
  "/auth/login": typeof loginSchema;
  "/bookings/preview": typeof bookingSchema;
  "/bookings": typeof bookingSchema;
};

export function validate<T extends keyof SchemaMap>(schema: SchemaMap[T]) {
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
