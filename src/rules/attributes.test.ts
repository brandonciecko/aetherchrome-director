import { describe, expect, it } from "vitest";
import { attributeCumulativeCost, attributeStepCost } from "./attributes";

describe("attributeStepCost", () => {
  it("costs 3 points to raise from 4 to 5 (the first Step)", () => {
    expect(attributeStepCost(5)).toBe(3);
  });

  it("increases every two Steps", () => {
    expect(attributeStepCost(5)).toBe(3);
    expect(attributeStepCost(6)).toBe(3);
    expect(attributeStepCost(7)).toBe(4);
    expect(attributeStepCost(8)).toBe(4);
    expect(attributeStepCost(9)).toBe(5);
  });

  it("rejects destinations below 5 or non-integers", () => {
    expect(() => attributeStepCost(4)).toThrow();
    expect(() => attributeStepCost(5.5)).toThrow();
  });
});

describe("attributeCumulativeCost", () => {
  it("is 0 for no change", () => {
    expect(attributeCumulativeCost(4, 4)).toBe(0);
  });

  it("sums Step costs across a raise", () => {
    expect(attributeCumulativeCost(4, 5)).toBe(3);
    expect(attributeCumulativeCost(4, 6)).toBe(6);
    expect(attributeCumulativeCost(4, 7)).toBe(10);
  });

  it("rejects a reduction", () => {
    expect(() => attributeCumulativeCost(6, 5)).toThrow();
  });
});
