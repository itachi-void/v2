export function useRouter() {
  return {
    push: (path: string) => {
      window.history.pushState({}, "", path);
    },
    replace: (path: string) => {
      window.history.replaceState({}, "", path);
    },
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => {},
    prefetch: async () => {},
  };
}

export function usePathname() {
  return typeof window !== "undefined" ? window.location.pathname : "/";
}

export function useSearchParams() {
  return typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}
