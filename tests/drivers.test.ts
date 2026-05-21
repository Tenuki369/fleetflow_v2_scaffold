import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { canUpdateAssignedLoadAsDriver } from "../lib/drivers";

describe("canUpdateAssignedLoadAsDriver", () => {
  it("allows non-driver roles through this driver ownership check", () => {
    expect(
      canUpdateAssignedLoadAsDriver({
        role: Role.DISPATCHER,
        currentUserId: "user_1",
        assignedDriverUserId: null,
      }),
    ).toBe(true);
  });

  it("allows a driver to update a load assigned to their driver profile", () => {
    expect(
      canUpdateAssignedLoadAsDriver({
        role: Role.DRIVER,
        currentUserId: "user_1",
        assignedDriverUserId: "user_1",
      }),
    ).toBe(true);
  });

  it("blocks a driver from updating unassigned or other-driver loads", () => {
    expect(
      canUpdateAssignedLoadAsDriver({
        role: Role.DRIVER,
        currentUserId: "user_1",
        assignedDriverUserId: null,
      }),
    ).toBe(false);

    expect(
      canUpdateAssignedLoadAsDriver({
        role: Role.DRIVER,
        currentUserId: "user_1",
        assignedDriverUserId: "user_2",
      }),
    ).toBe(false);
  });
});
