import { lazy, Suspense, createElement, ComponentType } from "react";

type Loader<T = any> = () => Promise<{ default: ComponentType<T> }>;

export default function dynamic<T = any>(loader: Loader<T>, _opts?: { ssr?: boolean }) {
  const Lazy = lazy(loader);
  return function DynamicComponent(props: T) {
    return createElement(
      Suspense,
      { fallback: null },
      createElement(Lazy as any, props as any)
    );
  };
}
