import { Repository } from "./Repository";
import { isString, shape, arrayOf } from "@/app/services/schema";

export interface AnalyticsHistoryRecord extends Record<string, unknown> {
  id: string;
  name: string;
  format: string;
  createdAt: string;
}

export interface AnalyticsScheduleRecord extends Record<string, unknown> {
  id: string;
  name: string;
  cadence: string;
  time: string;
  format: string;
  nextRun: string;
}

const historyValidator = arrayOf(shape<AnalyticsHistoryRecord>({
  id: isString, name: isString, format: isString, createdAt: isString,
}));

const scheduleValidator = arrayOf(shape<AnalyticsScheduleRecord>({
  id: isString, name: isString, cadence: isString, time: isString, format: isString, nextRun: isString,
}));

export const AnalyticsHistoryRepository = new Repository<AnalyticsHistoryRecord>({ resource: "analytics.history", endpoint: "/analytics/history", validator: historyValidator, cacheTtlMs: 60_000, paginated: true });
export const AnalyticsScheduleRepository = new Repository<AnalyticsScheduleRecord>({ resource: "analytics.scheduled", endpoint: "/analytics/schedules", validator: scheduleValidator, cacheTtlMs: 30_000 });
