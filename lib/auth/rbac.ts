import { Role } from "@prisma/client";

export type Resource = "load" | "driver" | "truck" | "invoice" | "user";
export type Action = "read" | "create" | "update" | "delete";

type Matrix = Record<Role, Record<Resource, Action[]>>;

// Permission matrix. Role X can perform actions Y on resource Z.
const MATRIX: Matrix = {
  OWNER: {
    load:    ["read", "create", "update", "delete"],
    driver:  ["read", "create", "update", "delete"],
    truck:   ["read", "create", "update", "delete"],
    invoice: ["read", "create", "update", "delete"],
    user:    ["read", "create", "update", "delete"],
  },
  ADMIN: {
    load:    ["read", "create", "update", "delete"],
    driver:  ["read", "create", "update", "delete"],
    truck:   ["read", "create", "update", "delete"],
    invoice: ["read", "create", "update", "delete"],
    user:    ["read", "create", "update"],
  },
  DISPATCHER: {
    load:    ["read", "create", "update"],
    driver:  ["read", "update"],
    truck:   ["read", "update"],
    invoice: ["read"],
    user:    ["read"],
  },
  DRIVER: {
    load:    ["read", "update"], // limited to status updates on assigned loads — enforce at handler.
    driver:  ["read"],
    truck:   ["read"],
    invoice: [],
    user:    ["read"],
  },
  ACCOUNTING: {
    load:    ["read"],
    driver:  ["read"],
    truck:   ["read"],
    invoice: ["read", "create", "update"],
    user:    ["read"],
  },
};

export interface AuthUser {
  userId: string;
  role: Role;
}

export function hasPermission(user: AuthUser, action: Action, resource: Resource): boolean {
  const allowed = MATRIX[user.role]?.[resource] ?? [];
  return allowed.includes(action);
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function requireRole(role: Role | Role[]) {
  const allowed = Array.isArray(role) ? role : [role];
  return (user: AuthUser) => {
    if (!allowed.includes(user.role)) {
      throw new ForbiddenError(`Requires role: ${allowed.join(" or ")}`);
    }
  };
}

export function requirePermission(user: AuthUser, action: Action, resource: Resource): void {
  if (!hasPermission(user, action, resource)) {
    throw new ForbiddenError(`Cannot ${action} ${resource}`);
  }
}
