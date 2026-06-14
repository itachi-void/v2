import { Repository } from "./Repository";
import { isString, isNumber, isBoolean, shape, arrayOf } from "@/app/services/schema";

export interface AssetRecord extends Record<string, unknown> {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  archived?: boolean;
}

export interface EmployeeRecord extends Record<string, unknown> {
  id: string;
  name: string;
  role: string;
  status: string;
  email: string;
  archived?: boolean;
}

export interface TransactionRecord extends Record<string, unknown> {
  id: string;
  ref: string;
  amount: number;
  date: string;
  status: string;
  paid?: boolean;
}

const assetValidator = arrayOf(shape<AssetRecord>({
  id: isString, name: isString, type: isString, status: isString, location: isString,
  archived: (v): v is boolean | undefined => v === undefined || isBoolean(v),
}));

const employeeValidator = arrayOf(shape<EmployeeRecord>({
  id: isString, name: isString, role: isString, status: isString, email: isString,
  archived: (v): v is boolean | undefined => v === undefined || isBoolean(v),
}));

const transactionValidator = arrayOf(shape<TransactionRecord>({
  id: isString, ref: isString, amount: isNumber, date: isString, status: isString,
  paid: (v): v is boolean | undefined => v === undefined || isBoolean(v),
}));

export const AssetRepository = new Repository<AssetRecord>({ resource: "resources.assets", endpoint: "/assets", validator: assetValidator });
export const EmployeeRepository = new Repository<EmployeeRecord>({ resource: "resources.employees", endpoint: "/employees", validator: employeeValidator });
export const TransactionRepository = new Repository<TransactionRecord>({ resource: "resources.transactions", endpoint: "/transactions", validator: transactionValidator });
