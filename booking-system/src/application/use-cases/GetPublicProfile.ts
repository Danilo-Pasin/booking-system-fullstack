import { UserRepository } from "../../domain/repositories/UserRepository";
import { AccommodationRepository } from "../../domain/repositories/AccommodationRepository";
import { NotFoundError } from "../../domain/errors/DomainError";

export interface GetPublicProfileInput {
  userId: string;
}

export class GetPublicProfile {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accommodationRepository: AccommodationRepository,
  ) {}

  async execute(input: GetPublicProfileInput) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new NotFoundError("User not found");

    const accommodations = await this.accommodationRepository.findByOwnerId(input.userId);

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
      accommodationCount: accommodations.length,
      createdAt: user.createdAt,
    };
  }
}
