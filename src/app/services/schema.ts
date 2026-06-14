export type Validator<T> = (input: unknown) => { ok: true; value: T } | { ok: false; error: string };

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isString(v: unknown): v is string {
  return typeof v === "string";
}

export function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

export function arrayOf<T>(itemValidator: Validator<T>): Validator<T[]> {
  return (input) => {
    if (!Array.isArray(input)) return { ok: false, error: "expected array" };
    const out: T[] = [];
    for (let i = 0; i < input.length; i++) {
      const r = itemValidator(input[i]);
      if (!r.ok) return { ok: false, error: `index ${i}: ${r.error}` };
      out.push(r.value);
    }
    return { ok: true, value: out };
  };
}

export function shape<T extends Record<string, unknown>>(spec: { [K in keyof T]: (v: unknown) => v is T[K] }): Validator<T> {
  return (input) => {
    if (!isObject(input)) return { ok: false, error: "expected object" };
    const out = {} as T;
    for (const key in spec) {
      const check = spec[key];
      const v = (input as Record<string, unknown>)[key];
      if (!check(v)) return { ok: false, error: `field ${String(key)} invalid` };
      out[key] = v as T[typeof key];
    }
    return { ok: true, value: out };
  };
}

export function validateOrFallback<T>(value: unknown, validator: Validator<T>, fallback: T, label: string): T {
  const result = validator(value);
  if (result.ok) return result.value;
  console.warn(`[schema] ${label} failed validation: ${result.error} — using fallback`);
  return fallback;
}
