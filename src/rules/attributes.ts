export const ATTRIBUTE_KEYS = ["strength", "health", "intelligence", "agility", "charisma", "essence"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  strength: "Strength",
  health: "Health",
  intelligence: "Intelligence",
  agility: "Agility",
  charisma: "Charisma",
  essence: "Essence"
};

export const ATTRIBUTE_ABBREVIATIONS: Record<AttributeKey, string> = {
  strength: "STR",
  health: "HLT",
  intelligence: "INT",
  agility: "AGL",
  charisma: "CHA",
  essence: "ESS"
};

/** System-wide standard range (source: Project Manifest Registry Attributes table). */
export const STANDARD_ATTRIBUTE_MIN = 1;
export const STANDARD_ATTRIBUTE_MAX = 9;

/**
 * Destination-based Attribute step cost (source: AEC — Attribute Costs v0.1, resolves OD-012).
 * Attribute 5 is Step 1: cost = 3 + floor((destination - 5) / 2), destination >= 5.
 * Costs at or below baseline (4) are not established by the ruleset — see plan Assumption 1;
 * this module only prices raises at or above 5 and callers must not allow reductions below baseline.
 */
export function attributeStepCost(destinationRating: number): number {
  if (!Number.isInteger(destinationRating) || destinationRating < 5) {
    throw new Error(`Attribute step cost is only defined for integer destinations >= 5 (got ${destinationRating})`);
  }
  return 3 + Math.floor((destinationRating - 5) / 2);
}

/** Cumulative cost to raise an Attribute from fromRating to toRating (toRating >= fromRating). */
export function attributeCumulativeCost(fromRating: number, toRating: number): number {
  if (toRating < fromRating) {
    throw new Error("Attribute reduction below its starting rating is not costed by the ruleset (Assumption 1)");
  }
  let total = 0;
  for (let destination = Math.max(fromRating + 1, 5); destination <= toRating; destination++) {
    total += attributeStepCost(destination);
  }
  return total;
}
