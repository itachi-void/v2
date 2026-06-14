import { request, type ApiResponse } from "@/app/services/apiClient";
import { type Validator, validateOrFallback } from "@/app/services/schema";
import { cacheGet, cacheSet, cacheInvalidate } from "@/app/services/cache";
import { emit } from "@/app/services/telemetry";

export interface RepositoryOptions<T> {
  resource: string;
  endpoint: string;
  validator?: Validator<T[]>;
  itemValidator?: Validator<T>;
  idKey?: keyof T;
  cacheTtlMs?: number;
  paginated?: boolean;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface Page<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class Repository<T extends Record<string, unknown>> {
  readonly endpoint: string;
  readonly resource: string;
  private readonly listValidator?: Validator<T[]>;
  private readonly itemValidator?: Validator<T>;
  private readonly idKey: keyof T;
  private readonly cacheTtlMs: number;
  private readonly paginated: boolean;
  private listeners = new Set<(rows: T[]) => void>();
  private cache: T[] = [];

  constructor(opts: RepositoryOptions<T>) {
    this.resource = opts.resource;
    this.endpoint = opts.endpoint;
    this.listValidator = opts.validator;
    this.itemValidator = opts.itemValidator;
    this.idKey = opts.idKey ?? ("id" as keyof T);
    this.cacheTtlMs = opts.cacheTtlMs ?? 0;
    this.paginated = opts.paginated ?? false;
  }

  subscribe(fn: (rows: T[]) => void): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.cache));
  }

  private validateList(data: unknown): T[] {
    if (!this.listValidator) return Array.isArray(data) ? (data as T[]) : [];
    return validateOrFallback(data, this.listValidator, [], `${this.resource}.list`);
  }

  private validateItem(data: unknown): T | null {
    if (data == null) return null;
    if (!this.itemValidator) return data as T;
    const r = this.itemValidator(data);
    if (r.ok) return r.value;
    console.warn(`[repo] ${this.resource} item failed validation: ${r.error}`);
    return null;
  }

  private cacheKey(suffix = ""): string {
    return `${this.resource}${suffix}`;
  }

  private bustCache(): void {
    if (this.cacheTtlMs > 0) cacheInvalidate(this.resource);
  }

  async list(): Promise<ApiResponse<T[]>> {
    if (this.cacheTtlMs > 0) {
      const hit = cacheGet<T[]>(this.cacheKey());
      if (hit) {
        emit({ kind: "cache", path: this.endpoint, event: "hit" });
        this.cache = hit;
        this.notify();
        return { ok: true, data: hit, meta: { latencyMs: 0, status: 200, attempts: 0, fromCache: true } };
      }
      emit({ kind: "cache", path: this.endpoint, event: "miss" });
    }
    const res = await request<unknown>(this.endpoint);
    if (!res.ok) return res;
    const rows = this.validateList(res.data);
    this.cache = rows;
    if (this.cacheTtlMs > 0) cacheSet(this.cacheKey(), rows, this.cacheTtlMs);
    this.notify();
    return { ok: true, data: rows, meta: res.meta };
  }

  async listPage(params: PageParams = {}): Promise<ApiResponse<Page<T>>> {
    if (!this.paginated) {
      const all = await this.list();
      if (!all.ok) return all;
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 25;
      const start = (page - 1) * pageSize;
      const rows = all.data.slice(start, start + pageSize);
      return { ok: true, data: { rows, total: all.data.length, page, pageSize }, meta: all.meta };
    }
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;
    const qs = `?page=${page}&pageSize=${pageSize}`;
    const res = await request<{ rows: unknown; total: number; page: number; pageSize: number }>(`${this.endpoint}${qs}`);
    if (!res.ok) return res;
    const rows = this.validateList(res.data.rows);
    return { ok: true, data: { rows, total: res.data.total, page: res.data.page, pageSize: res.data.pageSize }, meta: res.meta };
  }

  async get(id: T[keyof T]): Promise<ApiResponse<T | null>> {
    const res = await request<unknown>(`${this.endpoint}/${encodeURIComponent(String(id))}`);
    if (!res.ok) return res;
    return { ok: true, data: this.validateItem(res.data), meta: res.meta };
  }

  async create(row: T): Promise<ApiResponse<T>> {
    const prev = this.cache;
    this.cache = [row, ...prev];
    this.notify();
    const res = await request<unknown>(this.endpoint, { method: "POST", body: row, retry: false });
    if (!res.ok) {
      this.cache = prev;
      this.notify();
      return res;
    }
    const saved = this.validateItem(res.data) ?? row;
    this.cache = [saved, ...prev];
    this.bustCache();
    this.notify();
    return { ok: true, data: saved, meta: res.meta };
  }

  async update(id: T[keyof T], patch: Partial<T>): Promise<ApiResponse<T | null>> {
    const prev = this.cache;
    const idx = prev.findIndex((r) => r[this.idKey] === id);
    if (idx >= 0) {
      const optimistic = [...prev];
      optimistic[idx] = { ...optimistic[idx], ...patch };
      this.cache = optimistic;
      this.notify();
    }
    const res = await request<unknown>(`${this.endpoint}/${encodeURIComponent(String(id))}`, { method: "PUT", body: patch, retry: false });
    if (!res.ok) {
      this.cache = prev;
      this.notify();
      return res;
    }
    const saved = this.validateItem(res.data);
    if (saved && idx >= 0) {
      const next = [...this.cache];
      next[idx] = saved;
      this.cache = next;
      this.notify();
    }
    this.bustCache();
    return { ok: true, data: saved, meta: res.meta };
  }

  async remove(id: T[keyof T]): Promise<ApiResponse<boolean>> {
    const prev = this.cache;
    this.cache = prev.filter((r) => r[this.idKey] !== id);
    this.notify();
    const res = await request<unknown>(`${this.endpoint}/${encodeURIComponent(String(id))}`, { method: "DELETE", retry: false });
    if (!res.ok) {
      this.cache = prev;
      this.notify();
      return res;
    }
    this.bustCache();
    return { ok: true, data: true, meta: res.meta };
  }

  async replaceAll(rows: T[]): Promise<ApiResponse<T[]>> {
    const prev = this.cache;
    this.cache = rows;
    this.notify();
    const res = await request<unknown>(this.endpoint, { method: "PUT", body: rows, retry: false });
    if (!res.ok) {
      this.cache = prev;
      this.notify();
      return res;
    }
    const saved = this.validateList(res.data);
    this.cache = saved;
    this.bustCache();
    this.notify();
    return { ok: true, data: saved, meta: res.meta };
  }
}
