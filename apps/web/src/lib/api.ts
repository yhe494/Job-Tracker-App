// Minimal API client for the JobTrackr frontend.
// - Uses VITE_API_URL as the backend base URL
// - Always sends cookies (credentials: "include") so refresh-token cookie works
// - Adds Authorization header when an access token is available

export type ApiErrorData = {
  status: number;
  data?: unknown;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

if (!API_URL) {
  // Fail fast in dev so you don't silently call the wrong origin.
  // (Vite requires env vars to be prefixed with VITE_)
  console.warn("VITE_API_URL is not set. Create apps/web/.env.local with VITE_API_URL=http://localhost:4000");
}

// Access token is kept in-memory by default.
// Later we will add refresh + retry logic during frontend auth setup.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

function buildUrl(path: string) {
  const base = API_URL ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  // Common backend shapes:
  // { error: { message: string } }
  // { message: string }
  const maybeRecord = data as Record<string, unknown>;

  const maybeError = maybeRecord.error;
  if (maybeError && typeof maybeError === "object") {
    const errRec = maybeError as Record<string, unknown>;
    const msg = errRec.message;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;
  }

  const msg = maybeRecord.message;
  if (typeof msg === "string" && msg.trim().length > 0) return msg;

  return undefined;
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    ...(headers ?? {}),
  };
  const isFormData = rest.body instanceof FormData;
  // Default JSON content type when body is present and caller didn't set it.
  if (
    rest.body &&
    !isFormData &&
    !(finalHeaders as Record<string, string>)["Content-Type"]
  ) {
    (finalHeaders as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (auth && accessToken) {
    (finalHeaders as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    const message = extractErrorMessage(data) || res.statusText || "Request failed";

    throw new ApiError(message, res.status, data);
  }

  // Some endpoints return 204.
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return (await parseJsonSafe(res)) as T;
}

// Convenience helpers
export function get<T>(path: string, options?: RequestInit & { auth?: boolean }) {
  return api<T>(path, { ...(options ?? {}), method: "GET" });
}

export function post<T>(path: string, body?: unknown, options?: RequestInit & { auth?: boolean }) {
  return api<T>(path, {
    ...(options ?? {}),
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function patch<T>(path: string, body?: unknown, options?: RequestInit & { auth?: boolean }) {
  return api<T>(path, {
    ...(options ?? {}),
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function del<T>(path: string, options?: RequestInit & { auth?: boolean }) {
  return api<T>(path, { ...(options ?? {}), method: "DELETE" });
}
