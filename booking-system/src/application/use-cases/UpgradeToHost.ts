import { UserRepository } from "../../domain/repositories/UserRepository";
import { NotFoundError, AlreadyHostError } from "../../domain/errors/DomainError";
import { toUserResponse } from "./UserResponse";

export interface UpgradeToHostInput {
  userId: string;
}

export class UpgradeToHost {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpgradeToHostInput) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.role === "HOST") {
      throw new AlreadyHostError();
    }

    const updated = { ...user, role: "HOST" as const };
    await this.userRepository.update(updated);

    return toUserResponse(updated);
  }
}
