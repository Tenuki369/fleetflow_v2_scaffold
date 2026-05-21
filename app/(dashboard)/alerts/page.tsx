import { V2DemoApp } from "@/components/v2/V2DemoApp";

const routeLinks = {
  dispatch: "/dispatch",
  match: "/match",
  fleet: "/fleet",
  alerts: "/alerts",
} as const;

export default function AlertsPage() {
  return (
    <V2DemoApp
      initialView="alerts"
      homeHref="/dispatch"
      secondaryHref="/invoices"
      secondaryLabel="Open invoice queue"
      badgeLabel="V2 workspace"
      routeLinks={routeLinks}
    />
  );
}
