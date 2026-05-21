import { V2DemoApp } from "@/components/v2/V2DemoApp";

const routeLinks = {
  dispatch: "/dispatch",
  match: "/match",
  fleet: "/fleet",
  alerts: "/alerts",
} as const;

export default function MatchPage() {
  return (
    <V2DemoApp
      initialView="match"
      homeHref="/dispatch"
      secondaryHref="/loads/new"
      secondaryLabel="Create booked load"
      badgeLabel="V2 workspace"
      routeLinks={routeLinks}
    />
  );
}
