import { User } from "../../domain/entities/User";

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: "GUEST" | "HOST";
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    createdAt: user.createdAt,
  };
}
