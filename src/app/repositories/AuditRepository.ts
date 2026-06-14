import { Repository } from "./Repository";
import { isString, isBoolean, shape, arrayOf } from "@/app/services/schema";

export interface AuditRecord extends Record<string, unknown> {
  id: string;
  ts: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  severity: string;
  ip: string;
  hash: string;
  prevHash: string;
  success: boolean;
}

const validator = arrayOf(shape<AuditRecord>({
  id: isString, ts: isString, actor: isString, role: isString, action: isString,
  target: isString, severity: isString, ip: isString, hash: isString, prevHash: isString, success: isBoolean,
}));

export const AuditRepository = new Repository<AuditRecord>({ resource: "audit.log", endpoint: "/audit/log", validator, cacheTtlMs: 120_000, paginated: true });
