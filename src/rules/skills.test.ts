import { describe, expect, it } from "vitest";
import { skillCumulativeCost, validateSkillHierarchy } from "./skills";

describe("skillCumulativeCost", () => {
  it("matches the cumulative cost table from AEC — Skill Costs v0.1", () => {
    expect(skillCumulativeCost(0)).toBe(0);
    expect(skillCumulativeCost(1)).toBe(1);
    expect(skillCumulativeCost(3)).toBe(6);
    expect(skillCumulativeCost(6)).toBe(21);
    expect(skillCumulativeCost(10)).toBe(55);
  });

  it("rejects out-of-range ratings", () => {
    expect(() => skillCumulativeCost(-1)).toThrow();
    expect(() => skillCumulativeCost(11)).toThrow();
  });
});

describe("validateSkillHierarchy", () => {
  it("passes when every child rating is <= its parent", () => {
    const ratings = { "SKL-FIGHT": 4, "SKL-MELEE": 3, "SKL-SWORDS": 2 };
    expect(validateSkillHierarchy(ratings)).toEqual([]);
  });

  it("flags a child that exceeds its parent", () => {
    const ratings = { "SKL-FIGHT": 2, "SKL-MELEE": 3 };
    const issues = validateSkillHierarchy(ratings);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/Melee/);
  });

  it("by default (no availability set) pins Stealth to its registered parent Subterfuge at 0", () => {
    const issues = validateSkillHierarchy({ "SKL-STEALTH": 2 });
    expect(issues.some(issue => issue.includes("Stealth"))).toBe(true);
  });

  it("allows Stealth at 0 with no Subterfuge purchase", () => {
    expect(validateSkillHierarchy({ "SKL-STEALTH": 0 })).toEqual([]);
  });

  it("with a campaign availability set excluding Subterfuge, Stealth is unconstrained by it (Assumption 4)", () => {
    const availableSkillIds = new Set(["SKL-FIGHT", "SKL-MELEE", "SKL-SWORDS", "SKL-STEALTH"]); // no "SKL-SUBTERFUGE"
    const issues = validateSkillHierarchy({ "SKL-STEALTH": 6 }, availableSkillIds);
    expect(issues).toEqual([]);
  });

  it("still enforces normal parent caps when the parent is available (e.g. Melee under Fight)", () => {
    const availableSkillIds = new Set(["SKL-FIGHT", "SKL-MELEE", "SKL-STEALTH"]);
    const issues = validateSkillHierarchy({ "SKL-FIGHT": 1, "SKL-MELEE": 3 }, availableSkillIds);
    expect(issues.some(issue => issue.includes("Melee"))).toBe(true);
  });
});
