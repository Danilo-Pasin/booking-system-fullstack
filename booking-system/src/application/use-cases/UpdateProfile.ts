import bcrypt from "bcrypt";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { NotFoundError, ValidationError, InvalidCredentialsError } from "../../domain/errors/DomainError";
import { toUserResponse } from "./UserResponse";

export interface UpdateProfileInput {
  userId: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  currentPassword?: string;
  newPassword?: string;
}

export class UpdateProfile {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateProfileInput) {
    const existing = await this.userRepository.findById(input.userId);
    if (!existing) throw new NotFoundError("Usuário não encontrado");

    const updated = {
      ...existing,
      name: input.name ?? existing.name,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : existing.avatarUrl,
      bio: input.bio !== undefined ? input.bio : existing.bio,
    };

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new ValidationError("A senha atual é obrigatória para definir uma nova senha.");
      }
      const valid = await bcrypt.compare(input.currentPassword, existing.password);
      if (!valid) {
        throw new InvalidCredentialsError();
      }
      updated.password = await bcrypt.hash(input.newPassword, 12);
    }

    await this.userRepository.update(updated);

    return toUserResponse(updated);
  }
}
