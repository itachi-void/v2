import { Repository } from "./Repository";
import { isString, shape, arrayOf } from "@/app/services/schema";

export interface ReportRecord extends Record<string, unknown> {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

const validator = arrayOf(shape<ReportRecord>({
  id: isString, name: isString, type: isString, status: isString, createdAt: isString,
}));

export const ReportRepository = new Repository<ReportRecord>({ resource: "reports", endpoint: "/reports", validator });
