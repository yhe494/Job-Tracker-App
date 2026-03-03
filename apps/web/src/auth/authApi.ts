
import { del, get, patch, post, setAccessToken } from "../lib/api";

export type User = {
  userId: string;
  email: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name?: string;
};

type AuthResponse = {
  user: PublicUser;
  accessToken: string;
};

export async function register(input: { email: string; password: string; name?: string }) {
  const res = await post<AuthResponse>("/api/v1/auth/register", input, { auth: false });
  setAccessToken(res.accessToken);
  return res.user;
}

export async function login(input: { email: string; password: string }) {
  const res = await post<AuthResponse>("/api/v1/auth/login", input, { auth: false });
  setAccessToken(res.accessToken);
  return res.user;
}

/**
 * Uses refresh-token cookie (httpOnly) to get a new access token.
 * This call MUST include credentials, which api.ts already sets.
 */
export async function refresh() {
  const res = await post<{ accessToken: string }>("/api/v1/auth/refresh", undefined, { auth: false });
  setAccessToken(res.accessToken);
  return res.accessToken;
}

export async function logout() {
  // Clears refresh cookie server-side; also clear access token client-side
  await post<void>("/api/v1/auth/logout", undefined, { auth: false });
  setAccessToken(null);
}

export async function me() {
  const res = await get<{ user: User }>("/api/v1/auth/me");
  return res.user;
}

export async function updateMe(input: { name?: string }) {
  const res = await patch<{ user: PublicUser }>("/api/v1/auth/me", input);
  return res.user;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  // Your backend returns 204
  await patch<void>("/api/v1/auth/password", input);
}

export async function deleteAccount() {
  // Your backend returns 204 and clears refresh cookie
  await del<void>("/api/v1/auth/me");
  setAccessToken(null);
}