import { describe, expect, it } from "vitest";
import { attributeCumulativeCost, attributeStepCost } from "./attributes";

describe("attributeStepCost", () => {
  it("costs 3 points to raise from 14 to 15 (the first Step)", () => {
    expect(attributeStepCost(15)).toBe(3);
  });

  it("increases every two Steps going up", () => {
    expect(attributeStepCost(15)).toBe(3);
    expect(attributeStepCost(16)).toBe(3);
    expect(attributeStepCost(17)).toBe(4);
    expect(attributeStepCost(18)).toBe(4);
    expect(attributeStepCost(19)).toBe(5);
  });

  it("mirrors the same cost bands going down (Step Down)", () => {
    expect(attributeStepCost(13)).toBe(3);
    expect(attributeStepCost(12)).toBe(3);
    expect(attributeStepCost(11)).toBe(4);
    expect(attributeStepCost(10)).toBe(4);
  });

  it("rejects the baseline itself, non-integers, and destinations below the floor", () => {
    expect(() => attributeStepCost(14)).toThrow();
    expect(() => attributeStepCost(15.5)).toThrow();
    expect(() => attributeStepCost(9)).toThrow();
  });
});

describe("attributeCumulativeCost", () => {
  it("is 0 for no change", () => {
    expect(attributeCumulativeCost(14, 14)).toBe(0);
  });

  it("sums Step costs across a raise", () => {
    expect(attributeCumulativeCost(14, 15)).toBe(3);
    expect(attributeCumulativeCost(14, 16)).toBe(6);
    expect(attributeCumulativeCost(14, 17)).toBe(10);
  });

  it("refunds points for a Step Down, negative and mirrored", () => {
    expect(attributeCumulativeCost(14, 13)).toBe(-3);
    expect(attributeCumulativeCost(14, 12)).toBe(-6);
    expect(attributeCumulativeCost(14, 10)).toBe(-14);
  });

  it("rejects a Step Down past the floor of 10", () => {
    expect(() => attributeCumulativeCost(14, 9)).toThrow();
  });
});
