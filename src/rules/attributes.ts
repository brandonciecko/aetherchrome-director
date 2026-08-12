import { getCoreAttribute } from "./core-data";

export const ATTRIBUTE_KEYS = ["strength", "health", "intelligence", "agility", "charisma", "essence"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

/**
 * Director's fixed lowercase key scheme (used throughout DraftActor.attributes,
 * etc.) mapped to Core's real Attribute record IDs — labels, abbreviations,
 * and descriptions below are derived from Core (aetherchrome-core-data)
 * rather than hand-typed, so Core's 2026-08-11 addition of a public
 * description per Attribute (previously nonexistent) flows through here
 * automatically instead of needing to be retyped.
 */
const CORE_ATTRIBUTE_ID: Record<AttributeKey, string> = {
  strength: "ATTR-STR",
  health: "ATTR-HLT",
  intelligence: "ATTR-INT",
  agility: "ATTR-AGL",
  charisma: "ATTR-CHA",
  essence: "ATTR-ESS"
};

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = Object.fromEntries(
  ATTRIBUTE_KEYS.map(key => [key, getCoreAttribute(CORE_ATTRIBUTE_ID[key]).name])
) as Record<AttributeKey, string>;

export const ATTRIBUTE_ABBREVIATIONS: Record<AttributeKey, string> = Object.fromEntries(
  ATTRIBUTE_KEYS.map(key => [key, getCoreAttribute(CORE_ATTRIBUTE_ID[key]).abbreviation])
) as Record<AttributeKey, string>;

/** Public/production-facing description of what each Attribute governs. */
export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeKey, string> = Object.fromEntries(
  ATTRIBUTE_KEYS.map(key => [key, getCoreAttribute(CORE_ATTRIBUTE_ID[key]).description])
) as Record<AttributeKey, string>;

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
