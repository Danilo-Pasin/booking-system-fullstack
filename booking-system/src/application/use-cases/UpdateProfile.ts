import { randomUUID } from "crypto";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { NotFoundError, ValidationError, InvalidCredentialsError } from "../../domain/errors/DomainError";
import type { PasswordHasher } from "../../domain/services/PasswordHasher";
import { toUserResponse } from "./UserResponse";
import type { Image } from "../../domain/entities/Image";

export interface UpdateProfileInput {
  userId: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  images?: string[];
  currentPassword?: string;
  newPassword?: string;
}

export class UpdateProfile {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: UpdateProfileInput) {
    const existing = await this.userRepository.findById(input.userId);
    if (!existing) throw new NotFoundError("Usuário não encontrado");

    let images: Image[] | undefined;
    if (input.images !== undefined) {
      if (input.images.length > 10) {
        throw new ValidationError("Máximo de 10 imagens permitidas");
      }
      images = input.images.map((url, i) => ({
        id: randomUUID(),
        url,
        order: i,
        isPrimary: i === 0,
      }));
    }

    const avatarUrl = input.avatarUrl !== undefined
      ? input.avatarUrl
      : (input.images !== undefined
        ? (images && images.length > 0 ? images[0].url : undefined)
        : existing.avatarUrl);

    const updated = {
      ...existing,
      name: input.name ?? existing.name,
      avatarUrl,
      bio: input.bio !== undefined ? input.bio : existing.bio,
      images: images ?? existing.images,
    };

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new ValidationError("A senha atual é obrigatória para definir uma nova senha.");
      }
      const valid = await this.passwordHasher.compare(input.currentPassword, existing.password);
      if (!valid) {
        throw new InvalidCredentialsError();
      }
      updated.password = await this.passwordHasher.hash(input.newPassword);
    }

    await this.userRepository.update(updated);

    return toUserResponse(updated);
  }
}
