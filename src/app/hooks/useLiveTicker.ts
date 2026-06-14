import { useEffect, useRef, useState, useCallback } from "react";

export interface UseLiveTickerOptions {
  intervalMs: number;
  autoStart?: boolean;
}

export function useLiveTicker(callback: () => void, options: UseLiveTickerOptions) {
  const { intervalMs, autoStart = true } = options;
  const [live, setLive] = useState<boolean>(autoStart);
  const cbRef = useRef(callback);
  const idRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    if (idRef.current) {
      clearInterval(idRef.current);
      idRef.current = null;
    }
    setLive(false);
  }, []);

  const start = useCallback(() => {
    if (idRef.current) return;
    idRef.current = setInterval(() => {
      cbRef.current();
    }, intervalMs);
    setLive(true);
  }, [intervalMs]);

  useEffect(() => {
    if (autoStart) start();
    return () => {
      if (idRef.current) clearInterval(idRef.current);
      idRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { live, start, stop };
}

export default useLiveTicker;
