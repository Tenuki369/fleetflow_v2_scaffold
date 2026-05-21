import { V2DemoApp } from "@/components/v2/V2DemoApp";

const routeLinks = {
  dispatch: "/dispatch",
  match: "/match",
  fleet: "/fleet",
  alerts: "/alerts",
} as const;

export default function DispatchPage() {
  return (
    <V2DemoApp
      initialView="dispatch"
      homeHref="/dispatch"
      secondaryHref="/loads"
      secondaryLabel="Open load workspace"
      badgeLabel="V2 workspace"
      routeLinks={routeLinks}
    />
  );
}
