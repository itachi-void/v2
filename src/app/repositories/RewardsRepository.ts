import { Repository } from "./Repository";
import { isString, isNumber, shape, arrayOf } from "@/app/services/schema";

export type LedgerType = "earn" | "redeem";

/** A single points movement. `points` is always positive; `type` gives direction. */
export interface PointsEntry extends Record<string, unknown> {
  id: string;
  type: LedgerType;
  label: string;
  points: number;
  date: string;
  rewardId?: string;
}

export interface RewardRecord extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  stock: number;
  icon: string;
}

const ledgerValidator = arrayOf(
  shape<PointsEntry>({
    id: isString,
    type: (v): v is LedgerType => v === "earn" || v === "redeem",
    label: isString,
    points: isNumber,
    date: isString,
    rewardId: (v): v is string | undefined => v === undefined || isString(v),
  })
);

const rewardValidator = arrayOf(
  shape<RewardRecord>({
    id: isString,
    name: isString,
    description: isString,
    cost: isNumber,
    category: isString,
    stock: isNumber,
    icon: isString,
  })
);

export const PointsLedgerRepository = new Repository<PointsEntry>({
  resource: "rewards.ledger",
  endpoint: "/points-ledger",
  validator: ledgerValidator,
  cacheTtlMs: 30_000,
});

export const RewardRepository = new Repository<RewardRecord>({
  resource: "rewards.catalog",
  endpoint: "/rewards",
  validator: rewardValidator,
  cacheTtlMs: 60_000,
});

/** Net balance from a ledger: earned minus redeemed. */
export function computeBalance(entries: PointsEntry[]): number {
  return entries.reduce((sum, e) => sum + (e.type === "earn" ? e.points : -e.points), 0);
}
