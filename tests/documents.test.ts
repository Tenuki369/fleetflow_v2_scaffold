import { describe, expect, it } from "vitest";

import { isValidDocumentKey } from "../lib/documents";

describe("isValidDocumentKey", () => {
  it("accepts keys under the active org and load prefix", () => {
    expect(isValidDocumentKey("org_1", "load_1", "orgs/org_1/loads/load_1/pod.pdf")).toBe(true);
    expect(isValidDocumentKey("org_1", "load_1", "orgs/org_1/loads/load_1/docs/bol.pdf")).toBe(
      true,
    );
  });

  it("rejects keys for another org or load", () => {
    expect(isValidDocumentKey("org_1", "load_1", "orgs/org_2/loads/load_1/pod.pdf")).toBe(false);
    expect(isValidDocumentKey("org_1", "load_1", "orgs/org_1/loads/load_2/pod.pdf")).toBe(false);
  });

  it("requires a nested object key after the load prefix", () => {
    expect(isValidDocumentKey("org_1", "load_1", "orgs/org_1/loads/load_1")).toBe(false);
    expect(isValidDocumentKey("org_1", "load_1", "orgs/org_1/loads/load_1ish/pod.pdf")).toBe(
      false,
    );
  });
});
