export type TelemetryEvent =
  | {
      kind: "request";
      path: string;
      method: string;
      status: number;
      latencyMs: number;
      ok: true;
      attempt: number;
    }
  | {
      kind: "request";
      path: string;
      method: string;
      status: number;
      latencyMs: number;
      ok: false;
      code: string;
      attempt: number;
    }
  | {
      kind: "retry";
      path: string;
      method: string;
      attempt: number;
      delayMs: number;
      reason: string;
    }
  | { kind: "cache"; path: string; event: "hit" | "miss" | "stale" }
  | { kind: "dedup"; path: string };

type Listener = (e: TelemetryEvent) => void;

const listeners = new Set<Listener>();
const buffer: TelemetryEvent[] = [];
const BUFFER_MAX = 500;

interface Counters {
  requests: number;
  failures: number;
  retries: number;
  totalLatencyMs: number;
  byPath: Map<string, { count: number; failures: number; latencyMs: number }>;
}

const counters: Counters = {
  requests: 0,
  failures: 0,
  retries: 0,
  totalLatencyMs: 0,
  byPath: new Map(),
};

function bump(path: string, latencyMs: number, failed: boolean): void {
  const cur = counters.byPath.get(path) ?? {
    count: 0,
    failures: 0,
    latencyMs: 0,
  };
  cur.count += 1;
  cur.latencyMs += latencyMs;
  if (failed) cur.failures += 1;
  counters.byPath.set(path, cur);
}

export function emit(event: TelemetryEvent): void {
  buffer.push(event);
  if (buffer.length > BUFFER_MAX) buffer.shift();
  if (event.kind === "request") {
    counters.requests += 1;
    counters.totalLatencyMs += event.latencyMs;
    if (!event.ok) counters.failures += 1;
    bump(event.path, event.latencyMs, !event.ok);
  } else if (event.kind === "retry") {
    counters.retries += 1;
  }
  listeners.forEach((fn) => {
    try {
      fn(event);
    } catch {
      /* ignore */
    }
  });
}

export function onTelemetry(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getSnapshot() {
  const avg =
    counters.requests > 0 ? counters.totalLatencyMs / counters.requests : 0;
  const failureRate =
    counters.requests > 0 ? counters.failures / counters.requests : 0;
  return {
    requests: counters.requests,
    failures: counters.failures,
    retries: counters.retries,
    avgLatencyMs: Math.round(avg),
    failureRate,
    byPath: Array.from(counters.byPath.entries()).map(([path, v]) => ({
      path,
      count: v.count,
      failures: v.failures,
      avgLatencyMs: Math.round(v.latencyMs / Math.max(1, v.count)),
    })),
    recent: buffer.slice(-50),
  };
}

if (typeof window !== "undefined") {
  (window as any).__EcoSnapTelemetry = { getSnapshot, onTelemetry };
}
