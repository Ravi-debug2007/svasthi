import { describe, expect, it } from "vitest";
import { isActivePath, PRIMARY_NAV } from "@/lib/nav";

describe("isActivePath", () => {
  it("matches the home route exactly", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/journal", "/")).toBe(false);
  });

  it("matches section roots and nested paths, but not similar prefixes", () => {
    expect(isActivePath("/dawn", "/dawn")).toBe(true);
    expect(isActivePath("/dashboard/deep", "/dashboard")).toBe(true);
    expect(isActivePath("/journalx", "/journal")).toBe(false);
  });
});

describe("PRIMARY_NAV", () => {
  it("exposes exactly the four primary destinations from ui-rules.md", () => {
    expect(PRIMARY_NAV.map((item) => item.href)).toEqual([
      "/",
      "/journal",
      "/dawn",
      "/dashboard",
    ]);
  });
});
