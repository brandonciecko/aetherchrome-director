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

/**
 * System-wide standard range (source: AEC — Attributes and Overflow Dice.md
 * v0.0.4, per DR-0007). The scale is genuinely open-ended above 30 for any
 * campaign that permits advancement that far, but 30 is the highest
 * tabulated benchmark tier (Mythic) and the practical ceiling this app
 * exposes for creation-time range validation.
 */
export const STANDARD_ATTRIBUTE_MIN = 1;
export const STANDARD_ATTRIBUTE_MAX = 30;

/**
 * Every Actor receives a free Granted Baseline Attribute rating before
 * spending any character points (source: AEC — Attributes and Overflow
 * Dice.md §4 / AEC — Attribute Costs.md v0.0.5 §2, per DR-0007).
 */
export const ATTRIBUTE_GRANTED_BASELINE = 14;

/**
 * A campaign may permit Stepping an Attribute Down below the Granted
 * Baseline during creation only, for a refund on the same schedule as
 * raising it — but never below this floor (source: AEC — Attribute Costs.md
 * v0.0.5 §4, per DR-0007).
 */
export const ATTRIBUTE_STEP_DOWN_FLOOR = 10;

/**
 * Per-Step Attribute cost, by how many Steps the destination is from the
 * Granted Baseline of 14 (distance >= 1) — source: AEC — Attribute Costs.md
 * v0.0.5 §5 General Formula, resolves OD-012. The same formula prices both
 * directions: raising (destinations 15, 16, 17, ...) and, per §4, Stepping
 * Down (destinations 13, 12, 11, 10) — verified numerically identical to
 * the doc's own §4 Step-Down table when counted by distance from baseline
 * rather than by raw destination.
 */
function attributeStepCostAtDistance(distance: number): number {
  return 3 + Math.floor((distance - 1) / 2);
}

/**
 * Cost to move an Attribute Step from fromRating to fromRating + 1 (or, for
 * a Step Down, the refund for moving from fromRating to fromRating - 1).
 * destinationRating must be an integer, either > baseline (a raise) or in
 * [ATTRIBUTE_STEP_DOWN_FLOOR, baseline) (a Step Down) — see
 * attributeCumulativeCost, which is the function callers should normally use.
 */
export function attributeStepCost(destinationRating: number): number {
  if (!Number.isInteger(destinationRating)) {
    throw new Error(`Attribute step cost is only defined for integer destinations (got ${destinationRating})`);
  }
  if (destinationRating === ATTRIBUTE_GRANTED_BASELINE) {
    throw new Error("Attribute step cost is undefined at the Granted Baseline itself (no Step taken)");
  }
  if (destinationRating < ATTRIBUTE_STEP_DOWN_FLOOR) {
    throw new Error(
      `Attribute may not be Stepped Down below the ruleset floor of ${ATTRIBUTE_STEP_DOWN_FLOOR} (got ${destinationRating})`
    );
  }
  const distance = Math.abs(destinationRating - ATTRIBUTE_GRANTED_BASELINE);
  return attributeStepCostAtDistance(distance);
}

/**
 * Cumulative cost to move an Attribute from fromRating to toRating.
 * Positive when toRating > fromRating (points spent); negative when
 * toRating < fromRating (a Step Down refund, legal only at or above
 * ATTRIBUTE_STEP_DOWN_FLOOR, and only during creation per the ruleset).
 */
export function attributeCumulativeCost(fromRating: number, toRating: number): number {
  if (toRating === fromRating) return 0;
  if (toRating > fromRating) {
    let total = 0;
    for (let destination = Math.max(fromRating + 1, ATTRIBUTE_GRANTED_BASELINE + 1); destination <= toRating; destination++) {
      total += attributeStepCost(destination);
    }
    return total;
  }
  let refund = 0;
  for (let destination = Math.min(fromRating - 1, ATTRIBUTE_GRANTED_BASELINE - 1); destination >= toRating; destination--) {
    refund += attributeStepCost(destination);
  }
  return -refund;
}
