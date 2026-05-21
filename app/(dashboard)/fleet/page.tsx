import { V2DemoApp } from "@/components/v2/V2DemoApp";

const routeLinks = {
  dispatch: "/dispatch",
  match: "/match",
  fleet: "/fleet",
  alerts: "/alerts",
} as const;

export default function FleetPage() {
  return (
    <V2DemoApp
      initialView="fleet"
      homeHref="/dispatch"
      secondaryHref="/directory"
      secondaryLabel="Open directory records"
      badgeLabel="V2 workspace"
      routeLinks={routeLinks}
    />
  );
}
