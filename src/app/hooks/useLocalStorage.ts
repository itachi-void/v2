import { useState, useEffect, useCallback, useRef } from "react";
import { safeGet, safeSet, safeRemove } from "@/app/services/storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => safeGet<T>(key, initialValue));
  const lastSerialized = useRef<string>("");

  useEffect(() => {
    const serialized = JSON.stringify(value);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;
    safeSet(key, value);
  }, [key, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        const next = JSON.parse(e.newValue) as T;
        const serialized = JSON.stringify(next);
        if (serialized === lastSerialized.current) return;
        lastSerialized.current = serialized;
        setValue(next);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const remove = useCallback(() => {
    safeRemove(key);
    lastSerialized.current = "";
  }, [key]);

  return [value, setValue, remove] as const;
}

export default useLocalStorage;
