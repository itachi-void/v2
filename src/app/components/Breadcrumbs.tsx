import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Page title mapping
const pageTitles: Record<string, string> = {
  overview: "Overview",
  pickups: "Pickup Requests",
  routes: "Routes",
  drivers: "Drivers",
  fleet: "Fleet Map",
  alerts: "Smart Alerts",
  analytics: "Analytics",
  centers: "Centers",
  "centers-list": "Centers List",
  resources: "Resources",
  support: "Support Tickets",
  "citizen-stats": "Citizen Stats",
  communities: "Communities",
  "citizen-levels": "Levels & Progression",
  badges: "Badges & Achievements",
  leaderboards: "Leaderboards",
  permissions: "Permissions",
  performance: "Performance",
  reports: "Reports",
  partners: "Partners",
  audit: "Audit Log",
  "activity-log": "Activity Log",
  settings: "Settings",
  zones: "Zones",
  schedule: "Schedule",
  sustainability: "Sustainability",
  "ai-validation": "AI Validation",
  logistics: "Logistics Impact",
  portal: "Home",
  rewards: "Rewards",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const { user } = useAuth();
  const homePath = homePathForRole(user?.role ?? "citizen");
  const homeSegment = homePath.replace("/", "");
  const pathnames = location.pathname.split("/").filter((x) => x && x !== "#");

  if (pathnames.length === 0 || pathnames[0] === "login") {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", path: homePath },
  ];

  let currentPath = "";
  pathnames.forEach((segment) => {
    currentPath += `/${segment}`;
    // Skip the home segment itself — it's already represented by the Home crumb.
    if (segment === homeSegment) return;
    breadcrumbs.push({
      label: pageTitles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      path: currentPath,
    });
  });

  return (
    <nav className="flex items-center gap-2 text-sm mb-4 px-6 pt-4">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        return (
          <div key={crumb.path} className="flex items-center gap-2">
            {!isFirst && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            )}
            {isLast ? (
              <span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                {isFirst && <Home className="w-3.5 h-3.5" />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
