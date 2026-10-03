const NS = "EcoSnap";
const VERSION_SUFFIX = "v1";

export type StorageKey = string;

export function nsKey(key: string): string {
  if (key.startsWith(`${NS}.`)) return key;
  return `${NS}.${key}.${VERSION_SUFFIX}`;
}

export function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] read failed for ${key}`, err);
    return fallback;
  }
}

export function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[storage] write failed for ${key}`, err);
    return false;
  }
}

export function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] remove failed for ${key}`, err);
  }
}

export function listNamespace(prefix = NS): string[] {
  if (typeof window === "undefined") return [];
  const out: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(prefix)) out.push(k);
  }
  return out;
}

export function clearNamespace(prefix = NS): number {
  const keys = listNamespace(prefix);
  keys.forEach(safeRemove);
  return keys.length;
}

export const storage = {
  nsKey,
  safeGet,
  safeSet,
  safeRemove,
  listNamespace,
  clearNamespace,
};
export default storage;
