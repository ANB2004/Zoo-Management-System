const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const TOKEN_KEY = "keeperslog.tokens";

export interface Tokens {
  access: string;
  refresh: string;
}

export function getTokens(): Tokens | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  return raw ? (JSON.parse(raw) as Tokens) : null;
}

export function setTokens(tokens: Tokens | null) {
  if (tokens) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown, message: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function extractMessage(detail: unknown, fallback: string): string {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (typeof detail === "object") {
    const parts: string[] = [];
    for (const value of Object.values(detail as Record<string, unknown>)) {
      if (Array.isArray(value)) parts.push(value.join(" "));
      else if (typeof value === "string") parts.push(value);
    }
    if (parts.length) return parts.join(" ");
  }
  return fallback;
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  const isFormData = rest.body instanceof FormData;
  if (!isFormData && rest.body) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const tokens = getTokens();
    if (tokens) finalHeaders["Authorization"] = `Bearer ${tokens.access}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });

  if (response.status === 204) return undefined as T;

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body,
      extractMessage(body, `Request failed (${response.status})`)
    );
  }

  return body as T;
}

export const api = {
  get: <T>(path: string, auth = false) => request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, data?: unknown, auth = false) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined, auth }),
  patch: <T>(path: string, data?: unknown, auth = false) =>
    request<T>(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined, auth }),
  del: <T>(path: string, auth = false) => request<T>(path, { method: "DELETE", auth }),
};
