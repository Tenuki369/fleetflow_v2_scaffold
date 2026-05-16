import { LoadStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { deriveLoadStatusForWrite } from "../lib/loads";

describe("deriveLoadStatusForWrite", () => {
  it("sets available when no driver is assigned", () => {
    expect(deriveLoadStatusForWrite(null)).toBe(LoadStatus.AVAILABLE);
    expect(deriveLoadStatusForWrite(LoadStatus.AVAILABLE)).toBe(LoadStatus.AVAILABLE);
    expect(deriveLoadStatusForWrite(LoadStatus.ASSIGNED)).toBe(LoadStatus.AVAILABLE);
  });

  it("sets assigned when a driver is present and the load is assignable", () => {
    expect(deriveLoadStatusForWrite(null, "driver_1")).toBe(LoadStatus.ASSIGNED);
    expect(deriveLoadStatusForWrite(LoadStatus.AVAILABLE, "driver_1")).toBe(LoadStatus.ASSIGNED);
    expect(deriveLoadStatusForWrite(LoadStatus.ASSIGNED, "driver_1")).toBe(LoadStatus.ASSIGNED);
  });

  it.each([LoadStatus.IN_TRANSIT, LoadStatus.DELIVERED, LoadStatus.INVOICED])(
    "preserves terminal or active status %s",
    (status) => {
      expect(deriveLoadStatusForWrite(status)).toBe(status);
      expect(deriveLoadStatusForWrite(status, "driver_1")).toBe(status);
    },
  );
});
