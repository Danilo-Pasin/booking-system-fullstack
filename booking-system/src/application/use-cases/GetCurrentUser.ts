import { UserRepository } from "../../domain/repositories/UserRepository";
import { NotFoundError } from "../../domain/errors/DomainError";
import { toUserResponse } from "./UserResponse";

export interface GetCurrentUserInput {
  userId: string;
}

export class GetCurrentUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetCurrentUserInput) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return toUserResponse(user);
  }
}
