import { ValidationError } from "../../domain/errors/DomainError";
import type { StorageProvider } from "../../domain/services/StorageProvider";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

type UploadImageInput = {
  file: Buffer;
  fileName: string;
};

type UploadImageOutput = {
  url: string;
};

function detectMimeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "image/jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    (buffer[3] === 0x38 || buffer[3] === 0x37)
  ) {
    return "image/gif";
  }

  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export class UploadImage {
  constructor(private readonly storage: StorageProvider) {}

  async execute(input: UploadImageInput): Promise<UploadImageOutput> {
    const detected = detectMimeFromBuffer(input.file);
    if (!detected || !ALLOWED_MIME_TYPES.includes(detected)) {
      throw new ValidationError(
        `Invalid file type. Allowed: JPEG, PNG, WebP`,
      );
    }

    if (input.file.length > MAX_SIZE) {
      throw new ValidationError(
        `File too large. Maximum is 5MB (received ${(input.file.length / 1024 / 1024).toFixed(2)}MB).`,
      );
    }

    const url = await this.storage.upload(input.file, input.fileName, detected);
    return { url };
  }
}
