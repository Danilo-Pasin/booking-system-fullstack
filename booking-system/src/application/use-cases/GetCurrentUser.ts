import { UserRepository } from "../../domain/repositories/UserRepository";
import { NotFoundError } from "../../domain/errors/DomainError";
import { toUserResponse } from "./UserResponse";

export interface GetCurrentUserInput {
  userId: string;
}

export class GetCurrentUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetCurrentUserInput) {
    console.log("[GetCurrentUser] entry userId:", input.userId);
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      console.log("[GetCurrentUser] user not found");
      throw new NotFoundError("User not found");
    }

    console.log("[GetCurrentUser] exit OK");
    return toUserResponse(user);
  }
}
