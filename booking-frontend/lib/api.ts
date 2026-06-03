import type {
  Accommodation,
  Booking,
  DashboardData,
  PricePreview,
  User,
  UserPublic,
  CreateAccommodationData,
  UpdateAccommodationData,
  UpdateProfileData,
} from "./types";

export type { Booking } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

let _onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  _onUnauthorized = cb;
}

function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    _onUnauthorized?.();
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Request failed");
  return body as T;
}

export async function fetchAccommodations(queryString?: string): Promise<Accommodation[]> {
  const url = `${API_URL}/accommodations${queryString ?? ""}`;
  const res = await fetch(url, {
    credentials: "include",
  });
  return handleResponse<Accommodation[]>(res);
}

export async function fetchAccommodation(id: string): Promise<Accommodation> {
  const res = await fetch(`${API_URL}/accommodations/${id}`, {
    credentials: "include",
  });
  return handleResponse<Accommodation>(res);
}

export async function previewPrice(
  accommodationId: string,
  checkIn: string,
  checkOut: string,
): Promise<PricePreview> {
  const res = await fetch(`${API_URL}/bookings/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ accommodationId, checkIn, checkOut }),
  });
  return handleResponse<PricePreview>(res);
}

export async function createBooking(
  accommodationId: string,
  checkIn: string,
  checkOut: string,
  token: string,
): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    credentials: "include",
    body: JSON.stringify({ accommodationId, checkIn, checkOut }),
  });
  return handleResponse<Booking>(res);
}

export async function fetchBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings`, {
    headers: authHeader(token),
    credentials: "include",
  });
  return handleResponse<Booking[]>(res);
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse<{ token: string; user: User }>(res);
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ token: string; user: User }>(res);
}

export async function cancelBooking(id: string, token: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
    credentials: "include",
  });
  return handleResponse<Booking>(res);
}

export async function fetchMyAccommodations(token: string): Promise<Accommodation[]> {
  const res = await fetch(`${API_URL}/accommodations/mine`, {
    headers: authHeader(token),
    credentials: "include",
  });
  return handleResponse<Accommodation[]>(res);
}

export async function createAccommodation(
  data: CreateAccommodationData,
  token: string,
): Promise<Accommodation> {
  const res = await fetch(`${API_URL}/accommodations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<Accommodation>(res);
}

export async function updateAccommodation(
  id: string,
  data: UpdateAccommodationData,
  token: string,
): Promise<Accommodation> {
  const res = await fetch(`${API_URL}/accommodations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<Accommodation>(res);
}

export async function deleteAccommodation(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/accommodations/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
    credentials: "include",
  });
  await handleResponse<void>(res);
}

export async function fetchProfile(token?: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeader(token),
    credentials: "include",
  });
  return handleResponse<User>(res);
}

export async function updateProfile(
  data: UpdateProfileData,
  token: string,
): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<User>(res);
}

export async function fetchPublicUser(id: string): Promise<UserPublic> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    credentials: "include",
  });
  return handleResponse<UserPublic>(res);
}

export async function becomeHost(
  token?: string,
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/become-host`, {
    method: "PUT",
    headers: authHeader(token),
    credentials: "include",
  });
  return handleResponse<{ token: string; user: User }>(res);
}

export async function uploadImage(file: File, token: string): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/uploads/image`, {
    method: "POST",
    headers: authHeader(token),
    credentials: "include",
    body: formData,
  });
  return handleResponse<{ url: string }>(res);
}

export async function fetchHostDashboard(token: string): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/host/dashboard`, {
    headers: authHeader(token),
    credentials: "include",
  });
  return handleResponse<DashboardData>(res);
}

export async function updateBookingStatus(
  bookingId: string,
  status: "APPROVED" | "REJECTED",
  token: string,
): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return handleResponse<Booking>(res);
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  await handleResponse<void>(res);
}
