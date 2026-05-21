import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  type Action,
  ForbiddenError,
  hasPermission,
  requirePermission,
  requireRole,
  type Resource,
} from "../lib/auth/rbac";

const actions: Action[] = ["read", "create", "update", "delete"];
const resources: Resource[] = ["load", "customer", "driver", "truck", "invoice", "user"];

const expectedMatrix: Record<Role, Record<Resource, Action[]>> = {
  OWNER: {
    load: actions,
    customer: actions,
    driver: actions,
    truck: actions,
    invoice: actions,
    user: actions,
  },
  ADMIN: {
    load: actions,
    customer: actions,
    driver: actions,
    truck: actions,
    invoice: actions,
    user: ["read", "create", "update"],
  },
  DISPATCHER: {
    load: ["read", "create", "update"],
    customer: ["read", "create", "update"],
    driver: ["read", "update"],
    truck: ["read", "update"],
    invoice: ["read"],
    user: ["read"],
  },
  DRIVER: {
    load: ["read", "update"],
    customer: ["read"],
    driver: ["read"],
    truck: ["read"],
    invoice: [],
    user: ["read"],
  },
  ACCOUNTING: {
    load: ["read"],
    customer: ["read"],
    driver: ["read"],
    truck: ["read"],
    invoice: ["read", "create", "update"],
    user: ["read"],
  },
};

describe("RBAC matrix", () => {
  it.each(Object.values(Role))("matches expected permissions for %s", (role) => {
    for (const resource of resources) {
      for (const action of actions) {
        expect(hasPermission({ userId: "user_1", role }, action, resource)).toBe(
          expectedMatrix[role][resource].includes(action),
        );
      }
    }
  });

  it("throws ForbiddenError when a role is not allowed", () => {
    const guard = requireRole([Role.OWNER, Role.ADMIN]);

    expect(() => guard({ userId: "user_1", role: Role.DISPATCHER })).toThrow(ForbiddenError);
    expect(() => guard({ userId: "user_1", role: Role.OWNER })).not.toThrow();
  });

  it("throws ForbiddenError when a permission is missing", () => {
    expect(() =>
      requirePermission({ userId: "user_1", role: Role.DRIVER }, "create", "invoice"),
    ).toThrow(ForbiddenError);
    expect(() =>
      requirePermission({ userId: "user_1", role: Role.ACCOUNTING }, "create", "invoice"),
    ).not.toThrow();
  });
});
