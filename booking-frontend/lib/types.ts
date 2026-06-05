export type User = {
  id: string;
  name: string;
  email: string;
  role: "GUEST" | "HOST";
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
};

export type UserPublic = User & {
  accommodationCount?: number;
};

export type Accommodation = {
  id: string;
  name: string;
  type: "house" | "apartment" | "shared_room";
  pricePerNight: number;
  description?: string;
  imageUrl?: string;
  images?: { url: string; order: number }[];
  ownerId?: string;
};

export type FeeItem = {
  name: string;
  amount: number;
};

export type PricePreview = {
  base: number;
  fees: FeeItem[];
  total: number;
};

export type Booking = {
  id: string;
  checkIn: string;
  checkOut: string;
  basePrice: number;
  totalPrice: number;
  status?: string;
  createdAt: string;
  userId: string;
  userName?: string;
  accommodation: Accommodation;
};

export type HostBooking = {
  id: string;
  checkIn: string;
  checkOut: string;
  basePrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail?: string;
  accommodation: Accommodation;
};

export type DashboardData = {
  accommodationsCount: number;
  bookingsCount: number;
  estimatedRevenue: number;
  pendingBookings?: Booking[];
};

export type CreateAccommodationData = {
  name: string;
  type: string;
  pricePerNight: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
};

export type UpdateAccommodationData = {
  name?: string;
  pricePerNight?: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
};

export type UpdateProfileData = {
  name?: string;
  avatarUrl?: string;
  bio?: string;
};
