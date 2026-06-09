import { User } from "../../domain/entities/User";
import type { Image } from "../../domain/entities/Image";

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: "GUEST" | "HOST";
  avatarUrl: string | null;
  bio: string | null;
  images: Image[];
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
    images: user.images ?? [],
    createdAt: user.createdAt,
  };
}
