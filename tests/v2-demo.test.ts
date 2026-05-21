import { describe, expect, it } from "vitest";

import {
  demoAlerts,
  demoLoads,
  filterDemoLoads,
  getDemoAlertSummary,
  getDemoDispatchStats,
} from "../lib/v2-demo";

describe("filterDemoLoads", () => {
  it("returns all loads when filter is All and query is empty", () => {
    expect(filterDemoLoads(demoLoads, "All", "")).toHaveLength(demoLoads.length);
  });

  it("filters by status", () => {
    const delivered = filterDemoLoads(demoLoads, "Delivered", "");

    expect(delivered).toHaveLength(1);
    expect(delivered[0]?.id).toBe("L-1018");
  });

  it("filters by free-text query across route and driver fields", () => {
    expect(filterDemoLoads(demoLoads, "All", "coombs")).toHaveLength(1);
    expect(filterDemoLoads(demoLoads, "All", "memphis")).toHaveLength(1);
    expect(filterDemoLoads(demoLoads, "All", "northshore")).toHaveLength(1);
  });
});

describe("getDemoDispatchStats", () => {
  it("computes motion, pods due, revenue, and on-time score", () => {
    expect(getDemoDispatchStats(demoLoads)).toEqual({
      inMotion: 2,
      awaitingDriver: 1,
      podsToInvoice: 1,
      weeklyRevenueCents: 1440000,
      onTimePct: 94.6,
    });
  });
});

describe("getDemoAlertSummary", () => {
  it("rolls alerts into severity buckets", () => {
    expect(getDemoAlertSummary(demoAlerts)).toEqual({
      critical: 2,
      warning: 2,
      info: 1,
    });
  });
});
