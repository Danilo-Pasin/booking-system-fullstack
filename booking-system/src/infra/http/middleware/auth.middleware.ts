import { UnauthorizedError, HostOnlyError } from "../../../domain/errors/DomainError";
import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserRepository } from "../../../domain/repositories/UserRepository";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError();
  }
}

export function requireHost(userRepository: UserRepository) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const dbUser = await userRepository.findById(user.id);
    if (!dbUser || dbUser.role !== "HOST") {
      throw new HostOnlyError();
    }
  };
}
