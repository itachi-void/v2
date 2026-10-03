import { emit } from "./telemetry";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: {
    latencyMs: number;
    status: number;
    attempts: number;
    fromCache?: boolean;
  };
}

export interface ApiFailure {
  ok: false;
  error: { code: string; message: string; status?: number; cause?: unknown };
  meta?: { latencyMs: number; attempts: number };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOn: (code: string, status?: number) => boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
  tokenKey: string;
  onUnauthorized?: () => void;
  defaultHeaders: Record<string, string>;
  timeoutMs: number;
  schemaVersion: string;
  onSchemaMismatch?: (server: string, client: string) => void;
  defaultRetry: RetryPolicy;
}

const envBase =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_BASE_URL) ||
  "/api";

const defaultRetry: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 4_000,
  retryOn: (code, status) =>
    code === "NETWORK_ERROR" ||
    code === "TIMEOUT" ||
    code === "SERVER_ERROR" ||
    (status != null && status >= 500),
};

let config: ApiClientConfig = {
  baseUrl: envBase,
  tokenKey: "EcoSnap.auth.token",
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeoutMs: 15_000,
  schemaVersion: "1",
  defaultRetry,
  onUnauthorized: () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem("EcoSnap.auth.token");
    } catch {
      /* ignore */
    }
    // Browser-router redirect to the login route.
    if (window.location.pathname !== "/login") window.location.assign("/login");
  },
  onSchemaMismatch: (server, client) => {
    console.warn(
      `[apiClient] schema mismatch: server=${server} client=${client} — attempting graceful downgrade`,
    );
  },
};

export function configureApiClient(partial: Partial<ApiClientConfig>): void {
  config = { ...config, ...partial };
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const token = window.localStorage.getItem(config.tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

function mapHttpError(
  status: number,
  body: unknown,
): { code: string; message: string; status: number } {
  if (status === 0)
    return { code: "NETWORK_ERROR", message: "Network unreachable", status };
  if (status === 401)
    return { code: "UNAUTHORIZED", message: "Session expired", status };
  if (status === 403)
    return { code: "FORBIDDEN", message: "Not allowed", status };
  if (status === 404)
    return { code: "NOT_FOUND", message: "Resource not found", status };
  if (status === 409) return { code: "CONFLICT", message: "Conflict", status };
  if (status === 422 || status === 400) {
    const msg =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof (body as any).message === "string"
        ? (body as any).message
        : "Validation failed";
    return { code: "VALIDATION_ERROR", message: msg, status };
  }
  if (status === 429)
    return { code: "RATE_LIMITED", message: "Too many requests", status };
  if (status >= 500)
    return { code: "SERVER_ERROR", message: "Server error", status };
  return { code: "HTTP_ERROR", message: `HTTP ${status}`, status };
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  retry?: Partial<RetryPolicy> | false;
  dedupe?: boolean;
}

const inflight = new Map<string, Promise<ApiResponse<unknown>>>();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(policy: RetryPolicy, attempt: number): number {
  const exp = policy.baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * policy.baseDelayMs;
  return Math.min(policy.maxDelayMs, Math.floor(exp + jitter));
}

async function performOnce<T>(
  url: string,
  method: string,
  opts: RequestOptions,
): Promise<{ res: ApiResponse<T>; status: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const signal = opts.signal ?? controller.signal;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...config.defaultHeaders,
        "X-Schema-Version": config.schemaVersion,
        ...getAuthHeader(),
        ...(opts.headers ?? {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal,
      credentials: "include",
    });
    const latencyMs = Date.now() - start;
    const serverSchema = res.headers.get("X-Schema-Version");
    if (serverSchema && serverSchema !== config.schemaVersion) {
      config.onSchemaMismatch?.(serverSchema, config.schemaVersion);
    }
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }
    if (!res.ok) {
      const err = mapHttpError(res.status, parsed);
      if (res.status === 401) config.onUnauthorized?.();
      return {
        res: { ok: false, error: err, meta: { latencyMs, attempts: 1 } },
        status: res.status,
      };
    }
    return {
      res: {
        ok: true,
        data: parsed as T,
        meta: { latencyMs, status: res.status, attempts: 1 },
      },
      status: res.status,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const aborted = err instanceof DOMException && err.name === "AbortError";
    return {
      res: {
        ok: false,
        error: aborted
          ? {
              code: "TIMEOUT",
              message: "Request timed out",
              status: 0,
              cause: err,
            }
          : {
              code: "NETWORK_ERROR",
              message: err instanceof Error ? err.message : "Network error",
              status: 0,
              cause: err,
            },
        meta: { latencyMs, attempts: 1 },
      },
      status: 0,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function request<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const method = opts.method ?? "GET";
  const url = path.startsWith("http")
    ? path
    : `${config.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  const policy: RetryPolicy | null =
    opts.retry === false
      ? null
      : { ...config.defaultRetry, ...(opts.retry ?? {}) };
  const dedupeKey =
    method === "GET" && opts.dedupe !== false ? `${method} ${url}` : null;

  if (dedupeKey) {
    const existing = inflight.get(dedupeKey);
    if (existing) {
      emit({ kind: "dedup", path });
      return existing as Promise<ApiResponse<T>>;
    }
  }

  const exec = async (): Promise<ApiResponse<T>> => {
    let attempt = 0;
    let last: ApiResponse<T> | null = null;
    const totalStart = Date.now();
    while (true) {
      attempt += 1;
      const { res, status } = await performOnce<T>(url, method, opts);
      last = res;
      if (res.ok) {
        const meta = {
          ...(res.meta ?? { latencyMs: 0, status }),
          attempts: attempt,
        };
        emit({
          kind: "request",
          path,
          method,
          status: meta.status,
          latencyMs: meta.latencyMs,
          ok: true,
          attempt,
        });
        return { ...res, meta };
      }
      emit({
        kind: "request",
        path,
        method,
        status: status,
        latencyMs: res.meta?.latencyMs ?? 0,
        ok: false,
        code: res.error.code,
        attempt,
      });
      const canRetry =
        policy &&
        attempt < policy.maxAttempts &&
        policy.retryOn(res.error.code, res.error.status);
      if (!canRetry) {
        const totalLatency = Date.now() - totalStart;
        return {
          ok: false,
          error: res.error,
          meta: { latencyMs: totalLatency, attempts: attempt },
        };
      }
      const delay = backoffDelay(policy, attempt);
      emit({
        kind: "retry",
        path,
        method,
        attempt: attempt + 1,
        delayMs: delay,
        reason: res.error.code,
      });
      await wait(delay);
    }
  };

  const promise = exec();
  if (dedupeKey) {
    inflight.set(dedupeKey, promise as Promise<ApiResponse<unknown>>);
    promise.finally(() => {
      inflight.delete(dedupeKey);
    });
  }
  return promise;
}

export const apiClient = { request, configureApiClient };
export default apiClient;
