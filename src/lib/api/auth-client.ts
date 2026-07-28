import { siteConfig } from "@/config/site";
import type { ApiResponse } from "@/types/api";
import { buildGuestHeaders } from "@/lib/api/guest-client";

const TOKEN_KEY = "auth_token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function parseErrorBody(body: unknown, status: number): ApiError {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const message =
      (typeof record.message === "string" && record.message) ||
      (typeof record.error === "string" && record.error) ||
      `Request failed with status ${status}`;
    const errors =
      record.errors && typeof record.errors === "object"
        ? (record.errors as Record<string, string[]>)
        : undefined;

    return new ApiError(message, status, errors);
  }

  return new ApiError(`Request failed with status ${status}`, status);
}

function buildAuthHeaders(
  init?: RequestInit,
  options?: { auth?: boolean; guest?: boolean },
): Record<string, string> {
  const requiresAuth = options?.auth !== false;
  const allowGuest = options?.guest !== false;
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (requiresAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (allowGuest) {
    Object.assign(headers, buildGuestHeaders());
  }

  return headers;
}

export async function authFetch<T>(
  path: string,
  init?: RequestInit,
  options?: { auth?: boolean; guest?: boolean },
): Promise<T> {
  const response = await fetch(`${siteConfig.apiUrl}${path}`, {
    ...init,
    headers: buildAuthHeaders(init, options),
  });

  const body = (await response.json()) as ApiResponse<T> & {
    errors?: Record<string, string[]>;
  };

  if (!response.ok || !body.success) {
    throw parseErrorBody(body, response.status);
  }

  return body.data;
}

export async function authFetchMessage<T>(
  path: string,
  init?: RequestInit,
  options?: { auth?: boolean; guest?: boolean },
): Promise<{ data: T; message: string }> {
  const response = await fetch(`${siteConfig.apiUrl}${path}`, {
    ...init,
    headers: buildAuthHeaders(init, options),
  });

  const body = (await response.json()) as ApiResponse<T> & {
    errors?: Record<string, string[]>;
  };

  if (!response.ok || !body.success) {
    throw parseErrorBody(body, response.status);
  }

  return { data: body.data, message: body.message };
}

export function getFieldError(error: unknown, field: string): string | undefined {
  if (error instanceof ApiError && error.errors?.[field]?.[0]) {
    return error.errors[field][0];
  }

  return undefined;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      return "Unable to reach the store. Please try again.";
    }

    return error.message;
  }

  return fallback;
}
