import type { Image } from "./Image";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "GUEST" | "HOST";
  avatarUrl?: string;
  bio?: string;
  images?: Image[];
  createdAt: Date;
}
