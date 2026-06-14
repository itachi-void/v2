import type { Role } from "@/app/contexts/AuthContext";

// Pages explicitly allowed for citizens.
// Note: citizens get the personalized Citizen Portal (/portal) as their home
// instead of the operational /overview dashboard.
export const CITIZEN_PATHS = new Set([
  "/portal",
  "/leaderboards",
  "/badges",
  "/citizen-levels",
  "/rewards",
  "/settings",
  "/support",
]);

// Additional pages drivers can access (on top of citizen paths)
export const DRIVER_EXTRA_PATHS = new Set([
  "/routes",
  "/schedule",
  "/pickups",
  "/fleet",
]);

// Pages a center employee can access. They run the intake / verification desk.
export const EMPLOYEE_PATHS = new Set([
  "/verification",
  "/pickups",
  "/ai-validation",
  "/centers-list",
  "/settings",
  "/support",
]);

// Pages that only admins can access (managers excluded)
export const ADMIN_ONLY_PATHS = new Set(["/permissions", "/audit"]);

/** The landing route a user should be sent to after login / from "/". */
export function homePathForRole(role: Role): string {
  if (role === "citizen") return "/portal";
  if (role === "employee") return "/verification";
  return "/overview";
}

export function canAccess(role: Role, path: string): boolean {
  // Always allow login route handler upstream; here we gate app routes.
  if (role === "admin") return true;
  if (role === "manager") return !ADMIN_ONLY_PATHS.has(path);
  if (role === "driver") {
    return CITIZEN_PATHS.has(path) || DRIVER_EXTRA_PATHS.has(path);
  }
  if (role === "employee") {
    return EMPLOYEE_PATHS.has(path);
  }
  // citizen
  return CITIZEN_PATHS.has(path);
}
