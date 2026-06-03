import { v2 as cloudinary } from "cloudinary";
import type { StorageProvider } from "../../domain/services/StorageProvider";
import { UploadFailedError } from "../../domain/errors/DomainError";

export class CloudinaryStorage implements StorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(file: Buffer, _fileName: string, _mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "booking-system",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new UploadFailedError());
            return;
          }
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file);
    });
  }
}
