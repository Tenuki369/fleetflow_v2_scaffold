import { describe, expect, it } from "vitest";

import {
  getDemoSeedUser,
  isDemoAccessEnabled,
  parseDemoPersona,
} from "../lib/demo-access";

describe("parseDemoPersona", () => {
  it("accepts supported personas and rejects everything else", () => {
    expect(parseDemoPersona("owner")).toBe("owner");
    expect(parseDemoPersona("dispatcher")).toBe("dispatcher");
    expect(parseDemoPersona("driver")).toBe("driver");
    expect(parseDemoPersona("accounting")).toBeNull();
    expect(parseDemoPersona("")).toBeNull();
    expect(parseDemoPersona(undefined)).toBeNull();
  });
});

describe("isDemoAccessEnabled", () => {
  it("honors explicit overrides first", () => {
    expect(
      isDemoAccessEnabled({
        enableDemoAccess: "true",
        nodeEnv: "production",
        vercelEnv: "production",
      }),
    ).toBe(true);

    expect(
      isDemoAccessEnabled({
        enableDemoAccess: "false",
        nodeEnv: "development",
        vercelEnv: "preview",
      }),
    ).toBe(false);
  });

  it("defaults on for development and preview", () => {
    expect(
      isDemoAccessEnabled({
        nodeEnv: "development",
        vercelEnv: "development",
      }),
    ).toBe(true);

    expect(
      isDemoAccessEnabled({
        nodeEnv: "production",
        vercelEnv: "preview",
      }),
    ).toBe(true);

    expect(
      isDemoAccessEnabled({
        nodeEnv: "production",
        vercelEnv: "production",
      }),
    ).toBe(false);
  });
});

describe("getDemoSeedUser", () => {
  it("returns stable seeded identities for demo personas", () => {
    expect(getDemoSeedUser("owner")).toMatchObject({
      email: "owner@acme.test",
      name: "Anna Owner",
    });
    expect(getDemoSeedUser("driver")).toMatchObject({
      email: "dan@acme.test",
      name: "Dan Driver",
    });
  });
});
