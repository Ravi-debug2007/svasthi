import { describe, expect, it } from "vitest";
import {
  VERIFIED_RESOURCES,
  SAMPLE_RESOURCE,
  filterResources,
  RESOURCE_CATEGORIES,
} from "@/lib/resources";

describe("F10 resources data integrity", () => {
  it("includes credible verified Indian mental health resources", () => {
    expect(VERIFIED_RESOURCES.length).toBeGreaterThanOrEqual(5);
  });

  it("every verified resource has verified metadata, valid https URL, and honest description", () => {
    for (const r of VERIFIED_RESOURCES) {
      expect(r.id).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(r.operator).toBeTruthy();
      expect(r.description.length).toBeGreaterThan(20);
      expect(r.url.startsWith("https://")).toBe(true);
      expect(r.verifiedAsOf).toMatch(/^\d{4}-\d{2}$/);
      expect(r.hours).toBeTruthy();
      expect(r.cost).toBeTruthy();
      expect(r.languages.length).toBeGreaterThan(0);
      expect(r.isSample).toBeFalsy();

      if (r.phone) {
        expect(r.phoneDisplay).toBeTruthy();
        expect(r.phone).toMatch(/^[\d+]+$/);
      }
    }
  });

  it("distinguishes crisis services from non-crisis counseling", () => {
    const crisisResources = VERIFIED_RESOURCES.filter((r) => r.isCrisis);
    const nonCrisisResources = VERIFIED_RESOURCES.filter((r) => !r.isCrisis);

    expect(crisisResources.length).toBeGreaterThan(0);
    expect(nonCrisisResources.length).toBeGreaterThan(0);

    for (const r of crisisResources) {
      expect(r.category).toBe("crisis");
      expect(r.hours).toContain("24/7");
    }

    for (const r of nonCrisisResources) {
      expect(r.category).not.toBe("crisis");
    }
  });

  it("sample resource is strictly marked with isSample: true", () => {
    expect(SAMPLE_RESOURCE.isSample).toBe(true);
    expect(SAMPLE_RESOURCE.id).toBe("sample-community-clinic");
    expect(SAMPLE_RESOURCE.name).toContain("Example");
    expect(SAMPLE_RESOURCE.operator).toContain("Sample");
  });

  it("contains no therapeutic overclaims or clinical promises in descriptions", () => {
    const forbiddenClaims = [
      /\bcures?\b/i,
      /\bdiagnos(?:es|is)\b/i,
      /\bguaranteed?\s+relief\b/i,
      /\b100%\s+recovery\b/i,
      /\binstant\s+fix\b/i,
    ];

    for (const r of [...VERIFIED_RESOURCES, SAMPLE_RESOURCE]) {
      for (const pattern of forbiddenClaims) {
        expect(pattern.test(r.description)).toBe(false);
      }
    }
  });
});

describe("filterResources", () => {
  it("returns all items when category is 'all' and query is empty", () => {
    const all = filterResources(VERIFIED_RESOURCES, "all");
    expect(all.length).toBe(VERIFIED_RESOURCES.length);
  });

  it("filters correctly by category", () => {
    const crisisOnly = filterResources(VERIFIED_RESOURCES, "crisis");
    expect(crisisOnly.length).toBeGreaterThan(0);
    expect(crisisOnly.every((r) => r.category === "crisis")).toBe(true);

    const counselingOnly = filterResources(VERIFIED_RESOURCES, "counseling");
    expect(counselingOnly.length).toBeGreaterThan(0);
    expect(counselingOnly.every((r) => r.category === "counseling")).toBe(true);

    const studentOnly = filterResources(VERIFIED_RESOURCES, "student");
    expect(studentOnly.length).toBeGreaterThan(0);
    expect(studentOnly.every((r) => r.category === "student")).toBe(true);

    const specializedOnly = filterResources(VERIFIED_RESOURCES, "specialized");
    expect(specializedOnly.length).toBeGreaterThan(0);
    expect(specializedOnly.every((r) => r.category === "specialized")).toBe(true);
  });

  it("searches across name, operator, description, and languages", () => {
    const byName = filterResources(VERIFIED_RESOURCES, "all", "Tele-MANAS");
    expect(byName.some((r) => r.id === "tele-manas")).toBe(true);

    const byOperator = filterResources(VERIFIED_RESOURCES, "all", "TISS");
    expect(byOperator.some((r) => r.id === "icall-tiss")).toBe(true);

    const byLanguage = filterResources(VERIFIED_RESOURCES, "all", "Konkani");
    expect(byLanguage.some((r) => r.id === "sangath-youth")).toBe(true);

    const noMatch = filterResources(VERIFIED_RESOURCES, "all", "xyzNonExistentSearch999");
    expect(noMatch.length).toBe(0);
  });
});

describe("RESOURCE_CATEGORIES", () => {
  it("includes all 5 expected categories with clear descriptions", () => {
    const ids = RESOURCE_CATEGORIES.map((c) => c.id);
    expect(ids).toEqual(["all", "crisis", "counseling", "student", "specialized"]);
    expect(RESOURCE_CATEGORIES.every((c) => c.label && c.description)).toBe(true);
  });
});
