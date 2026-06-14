import { useCallback, useEffect, useRef, useState } from "react";
import type { Repository, PageParams, Page } from "@/app/repositories/Repository";
import type { ApiResponse } from "@/app/services/apiClient";

export type RequestStatus = "idle" | "loading" | "retrying" | "success" | "error";

export interface RequestState<T> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
  attempts: number;
}

export function useAsync<T>(): [RequestState<T>, (op: () => Promise<ApiResponse<T>>) => Promise<ApiResponse<T>>, () => Promise<ApiResponse<T>> | null] {
  const [state, setState] = useState<RequestState<T>>({ data: null, status: "idle", error: null, attempts: 0 });
  const lastOp = useRef<(() => Promise<ApiResponse<T>>) | null>(null);

  const run = useCallback(async (op: () => Promise<ApiResponse<T>>) => {
    lastOp.current = op;
    setState((s) => ({ ...s, status: s.status === "error" ? "retrying" : "loading", error: null }));
    const res = await op();
    if (res.ok) setState({ data: res.data, status: "success", error: null, attempts: res.meta?.attempts ?? 1 });
    else setState((s) => ({ ...s, status: "error", error: res.error.message, attempts: res.meta?.attempts ?? s.attempts }));
    return res;
  }, []);

  const retry = useCallback(() => (lastOp.current ? run(lastOp.current) : null), [run]);

  return [state, run, retry];
}

export function useRepository<T extends Record<string, unknown>>(repo: Repository<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const load = useCallback(async () => {
    setStatus((s) => (s === "error" ? "retrying" : "loading"));
    setError(null);
    const res = await repo.list();
    if (res.ok) {
      setRows(res.data);
      setAttempts(res.meta?.attempts ?? 1);
      setStatus("success");
    } else {
      setError(res.error.message);
      setAttempts(res.meta?.attempts ?? 1);
      setStatus("error");
    }
  }, [repo]);

  useEffect(() => {
    let mounted = true;
    load();
    const unsub = repo.subscribe((next) => { if (mounted) setRows(next); });
    return () => { mounted = false; unsub(); };
  }, [repo, load]);

  const create = useCallback((row: T) => repo.create(row), [repo]);
  const update = useCallback((id: T[keyof T], patch: Partial<T>) => repo.update(id, patch), [repo]);
  const remove = useCallback((id: T[keyof T]) => repo.remove(id), [repo]);
  const replaceAll = useCallback((next: T[]) => repo.replaceAll(next), [repo]);

  return { rows, status, error, attempts, reload: load, retry: load, create, update, remove, replaceAll };
}

export function useRepositoryPage<T extends Record<string, unknown>>(repo: Repository<T>, params: PageParams) {
  const [page, setPage] = useState<Page<T> | null>(null);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus((s) => (s === "error" ? "retrying" : "loading"));
    setError(null);
    const res = await repo.listPage(params);
    if (res.ok) { setPage(res.data); setStatus("success"); }
    else { setError(res.error.message); setStatus("error"); }
  }, [repo, params.page, params.pageSize]);

  useEffect(() => { load(); }, [load]);

  return { page, status, error, reload: load, retry: load };
}
