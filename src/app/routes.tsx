import { createBrowserRouter, Navigate, Outlet, useLocation, useParams } from "react-router";
import { Toaster } from "sonner";
import { useDirection } from "./hooks/useDirection";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { PickupProvider, usePickup } from "@/app/contexts/PickupContext";
import { DriversProvider, useDrivers } from "@/app/contexts/DriversContext";
import { PartnersProvider } from "@/app/contexts/PartnersContext";
import { NotificationProvider } from "@/app/contexts/NotificationContext";
import { VerificationHistoryProvider } from "@/app/contexts/VerificationHistoryContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import TopBar from "./components/TopBar";
import CommandPalette from "./components/CommandPalette";
import RadialMenu from "./components/RadialMenu";
import ProtectedRoute from "./components/ProtectedRoute";
import Breadcrumbs from "./components/Breadcrumbs";
import { WaveBackdrop } from "./components/WaveBackdrop";
import ZoneHeatmap from "@/imports/ZoneHeatmap-1";
import OverviewHero from "./components/overview/OverviewHero";
import OperationalKPIs from "./components/overview/OperationalKPIs";
import LiveOperationsFeed from "./components/overview/LiveOperationsFeed";
import TodaysGoals from "./components/overview/TodaysGoals";
import IsometricCentersHub from "@/imports/IsometricCentersHub";
import PlaceholderPage from "./pages/PlaceholderPage";
import { placeholderPages } from "./pages/placeholderConfig";
import QuickActions from "./components/QuickActions";
import InfrastructureHealthCard from "./components/InfrastructureHealthCard";
import SmartAlertsPage from "./pages/SmartAlertsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DriversListPage from "./pages/DriversListPage";
import ReportsPage from "./pages/ReportsPage";
import PerformanceDashboardPage from "./pages/PerformanceDashboardPage";
import ResourceManagementPage from "./pages/ResourceManagementPage";
import CommunitiesMapPage from "./pages/CommunitiesMapPage";
import LogisticsImpactPage from "./pages/LogisticsImpactPage";
import RoutesPage from "./pages/RoutesPage";
import CitizenStatsPage from "./pages/CitizenStatsPage";
import CentersListPage from "./pages/CentersListPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import SupportTicketsPage from "./pages/SupportTicketsPage";
import AiValidationPage from "./pages/AiValidationPage";
import VerificationStationPage from "./pages/VerificationStationPage";
import DriverOverviewPage from "./pages/DriverOverviewPage";
import EmployeeHistoryPage from "./pages/EmployeeHistoryPage";
import EmployeeProfilePage from "./pages/EmployeeProfilePage";
import FleetMapPage from "./pages/FleetMapPage";
import PickupRequestsPage from "./pages/PickupRequestsPage";
import SustainabilityPage from "./pages/SustainabilityPage";
import SchedulePage from "./pages/SchedulePage";
import AuditLogPage from "./pages/AuditLogPage";
import PermissionsPage from "./pages/PermissionsPage";
import SettingsPage from "./pages/SettingsPage";
import BadgesPage from "./pages/BadgesPage";
import LeaderboardsPage from "./pages/LeaderboardsPage";
import CitizenLevelsPage from "./pages/CitizenLevelsPage";
import RewardsPage from "./pages/RewardsPage";
import PartnersPage from "./pages/PartnersPage";
import LoginPage from "./pages/LoginPage";
import LoginPageLampA from "./pages/LoginPageLampA";
import LoginPageLampB from "./pages/LoginPageLampB";
import LoginPageLampC from "./pages/LoginPageLampC";
import LoginPageLampD from "./pages/LoginPageLampD";
import LandingPage from "./pages/LandingPage";
import CitizenPortalPage from "./pages/CitizenPortalPage";
import { homePathForRole } from "./utils/roleAccess";
import TestPage from "./pages/TestPage";
import NotFoundPage from "./pages/NotFoundPage";

function DirectionShell({ children }: { children: React.ReactNode }) {
  const { dir } = useDirection();
  return (
    <div dir={dir} className="relative min-h-screen bg-[#d8edf8] dark:bg-[#070a0f] overflow-hidden">
      {children}
    </div>
  );
}

function OverviewPage() {
  const { requests } = usePickup();
  const { drivers } = useDrivers();

  const activePickups = requests.filter((r) => r.status !== "Completed").length;
  const completedPickups = requests.filter((r) => r.status === "Completed").length;
  const driversOnRoad = drivers.filter((d) => d.status === "active").length;
  const totalWeight = requests.reduce(
    (s, r) => s + r.items.reduce((a, i) => a + i.expectedWeightKg, 0),
    0
  );
  const todayTonnage = Math.round((totalWeight * 1.8) * 10) / 10;
  const fleetUtilization = Math.min(
    100,
    Math.round((driversOnRoad / Math.max(drivers.length, 1)) * 100)
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <OverviewHero activePickups={activePickups} driversOnRoad={driversOnRoad} />
      <OperationalKPIs
        activePickups={activePickups}
        driversOnRoad={driversOnRoad}
        totalDrivers={drivers.length}
        todayTonnage={todayTonnage}
        fleetUtilization={fleetUtilization}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveOperationsFeed />
        </div>
        <TodaysGoals
          completedPickups={completedPickups}
          totalPickups={requests.length}
          todayTonnage={todayTonnage}
          driversOnRoad={driversOnRoad}
          totalDrivers={drivers.length}
        />
      </div>
      <InfrastructureHealthCard />
      <QuickActions />
    </div>
  );
}

function GlassPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function CentersPage() {
  return (
    <GlassPage>
      <IsometricCentersHub />
    </GlassPage>
  );
}

function ZonesPage() {
  return (
    <GlassPage>
      <ZoneHeatmap />
    </GlassPage>
  );
}

function PlaceholderRoute() {
  const params = useParams();
  const slug = params.slug ?? params["*"];
  const config = placeholderPages.find((p) => p.slug === slug);
  if (!config) return <Navigate to="/overview" replace />;
  return (
    <PlaceholderPage
      title={config.title}
      subtitle={config.subtitle}
      Icon={config.Icon}
      accent={config.accent}
      bullets={config.bullets}
    />
  );
}

/** Root "/" — landing for guests, role-aware home for authenticated users. */
function HomeGate() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role ?? "citizen")} replace />;
  }
  return <LandingPage />;
}

/** App chrome shown around every route. Lives inside the providers + router. */
function Shell() {
  const { isAuthenticated } = useAuth();
  // صفحة الهبوط مستقلة بنافبارها الخاص — نخفي هيكل اللوحة (TopBar/Breadcrumbs…) عليها.
  const { pathname } = useLocation();
  const isLanding = pathname === "/" || pathname === "/landing";
  const showChrome = isAuthenticated && !isLanding;
  return (
    <>
      {showChrome && <TopBar />}
      {showChrome && <CommandPalette />}
      {showChrome && <RadialMenu />}
      <main className="pb-12">
        {showChrome && <Breadcrumbs />}
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Toaster position="top-right" richColors />
    </>
  );
}

/** Top-level layout: providers + backdrop + chrome. Rendered inside RouterProvider. */
function Root() {
  // Landing page ("/" and "/landing") has its own gradient + particles; skip the wave backdrop there.
  const { pathname } = useLocation();
  const isLanding = pathname === "/" || pathname === "/landing";
  return (
    <AuthProvider>
      <RoleProvider>
        <PickupProvider>
          <DriversProvider>
            <PartnersProvider>
              <NotificationProvider>
                <VerificationHistoryProvider>
                <DirectionShell>
                  {!isLanding && <WaveBackdrop />}
                  <div className="relative z-10">
                    <Shell />
                  </div>
                </DirectionShell>
                </VerificationHistoryProvider>
              </NotificationProvider>
            </PartnersProvider>
          </DriversProvider>
        </PickupProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  // Standalone 404 — no shell, no auth, full-screen
  { path: "/404", Component: NotFoundPage },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomeGate },
      { path: "landing", Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "login-a", Component: LoginPageLampA },
      { path: "login-b", Component: LoginPageLampB },
      { path: "login-c", Component: LoginPageLampC },
      { path: "login-d", Component: LoginPageLampD },
      { path: "test", Component: TestPage },

      { path: "portal", element: <ProtectedRoute><CitizenPortalPage /></ProtectedRoute> },
      { path: "overview", element: <ProtectedRoute allowedRoles={["admin", "manager", "driver"]}><OverviewPage /></ProtectedRoute> },
      { path: "driver-home", element: <ProtectedRoute allowedRoles={["admin", "manager", "driver"]}><DriverOverviewPage /></ProtectedRoute> },

      { path: "zones", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><ZonesPage /></ProtectedRoute> },
      { path: "centers", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><CentersPage /></ProtectedRoute> },
      { path: "alerts", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><SmartAlertsPage /></ProtectedRoute> },
      { path: "analytics", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><AnalyticsPage /></ProtectedRoute> },
      { path: "drivers", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><DriversListPage /></ProtectedRoute> },
      { path: "reports", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><ReportsPage /></ProtectedRoute> },
      { path: "performance", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><PerformanceDashboardPage /></ProtectedRoute> },
      { path: "resources", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><ResourceManagementPage /></ProtectedRoute> },
      { path: "communities", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><CommunitiesMapPage /></ProtectedRoute> },
      { path: "logistics", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><LogisticsImpactPage /></ProtectedRoute> },

      { path: "routes", element: <ProtectedRoute allowedRoles={["admin", "manager", "driver"]}><RoutesPage /></ProtectedRoute> },
      { path: "schedule", element: <ProtectedRoute allowedRoles={["admin", "manager", "driver"]}><SchedulePage /></ProtectedRoute> },
      { path: "pickups", element: <ProtectedRoute allowedRoles={["admin", "manager", "driver"]}><PickupRequestsPage /></ProtectedRoute> },
      { path: "fleet", element: <ProtectedRoute allowedRoles={["admin", "manager", "driver"]}><FleetMapPage /></ProtectedRoute> },

      { path: "citizen-stats", element: <ProtectedRoute><CitizenStatsPage /></ProtectedRoute> },
      { path: "leaderboards", element: <ProtectedRoute><LeaderboardsPage /></ProtectedRoute> },
      { path: "leaderboard", element: <Navigate to="/leaderboards" replace /> },
      { path: "badges", element: <ProtectedRoute><BadgesPage /></ProtectedRoute> },
      { path: "citizen-levels", element: <ProtectedRoute><CitizenLevelsPage /></ProtectedRoute> },
      { path: "rewards", element: <ProtectedRoute><RewardsPage /></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { path: "support", element: <ProtectedRoute><SupportTicketsPage /></ProtectedRoute> },

      { path: "centers-list", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><CentersListPage /></ProtectedRoute> },
      { path: "activity-log", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><ActivityLogPage /></ProtectedRoute> },
      { path: "ai-validation", element: <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><AiValidationPage /></ProtectedRoute> },
      { path: "verification", element: <ProtectedRoute allowedRoles={["admin", "manager", "driver", "employee"]}><VerificationStationPage /></ProtectedRoute> },
      { path: "employee-history", element: <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><EmployeeHistoryPage /></ProtectedRoute> },
      { path: "employee-profile", element: <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}><EmployeeProfilePage /></ProtectedRoute> },
      { path: "sustainability", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><SustainabilityPage /></ProtectedRoute> },
      { path: "partners", element: <ProtectedRoute allowedRoles={["admin", "manager"]}><PartnersPage /></ProtectedRoute> },

      { path: "audit", element: <ProtectedRoute allowedRoles={["admin"]}><AuditLogPage /></ProtectedRoute> },
      { path: "permissions", element: <ProtectedRoute allowedRoles={["admin"]}><PermissionsPage /></ProtectedRoute> },

      { path: "*", element: <ProtectedRoute><PlaceholderRoute /></ProtectedRoute> },
    ],
  },
]);
