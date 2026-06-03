import { UserRepository } from "../../domain/repositories/UserRepository";
import { NotFoundError } from "../../domain/errors/DomainError";
import { toUserResponse } from "./UserResponse";

export interface UpdateProfileInput {
  userId: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
}

export class UpdateProfile {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateProfileInput) {
    const existing = await this.userRepository.findById(input.userId);
    if (!existing) throw new NotFoundError("User not found");

    const updated = {
      ...existing,
      name: input.name ?? existing.name,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : existing.avatarUrl,
      bio: input.bio !== undefined ? input.bio : existing.bio,
    };

    await this.userRepository.update(updated);

    return toUserResponse(updated);
  }
}
