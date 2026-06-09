import type { FastifyInstance } from "fastify";
import type { FastifyRequest } from "fastify";
import { authenticate } from "../middleware/auth.middleware";
import type { UploadImage } from "../../../application/use-cases/UploadImage";
import { ValidationError } from "../../../domain/errors/DomainError";

type MultipartFile = {
  filename: string;
  mimetype: string;
  toBuffer: () => Promise<Buffer>;
};

export async function registerUploadRoutes(
  app: FastifyInstance,
  deps: { uploadImage: UploadImage },
) {
  app.post(
    "/uploads/image",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Uploads"],
        summary: "Enviar imagem para Cloudinary",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        response: {
          200: {
            description: "URL da imagem",
            type: "object",
            properties: { url: { type: "string" } },
          },
          400: {
            description: "Erro de validação",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request: FastifyRequest, reply) => {
      const file = await request.file() as MultipartFile | undefined;
      if (!file) {
        throw new ValidationError("Nenhum arquivo enviado");
      }

      const buffer = await file.toBuffer();
      const result = await deps.uploadImage.execute({
        file: buffer,
        fileName: `${Date.now()}-${file.filename}`,
      });

      return result;
    },
  );
}
