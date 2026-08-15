import { getItem } from "./items";
import { getCarryState } from "./types";
import type { CampaignProfile } from "./campaigns";
import type { DraftActor } from "./types";

export type EncumbranceTier = "None" | "Light" | "Medium" | "Heavy" | "Extreme" | "Overloaded";

export interface EncumbranceResult {
  totalLoad: number;
  strength: number;
  tier: EncumbranceTier;
  /** "EP" — applied as the Encumbered Status's Intensity. Informational only; Director doesn't model Task rolls. */
  encumbrancePenalty: number;
}

/**
 * Tier thresholds are multiples of Effective Strength (source: AEC —
 * Equipment System.md §8.1.3): None through 1x, Light through 2x, Medium
 * through 3x, Heavy through 4x, Extreme through 5x, Overloaded beyond.
 */
const TIERS: { tier: EncumbranceTier; strengthMultiplier: number; encumbrancePenalty: number }[] = [
  { tier: "None", strengthMultiplier: 1, encumbrancePenalty: 0 },
  { tier: "Light", strengthMultiplier: 2, encumbrancePenalty: 1 },
  { tier: "Medium", strengthMultiplier: 3, encumbrancePenalty: 2 },
  { tier: "Heavy", strengthMultiplier: 4, encumbrancePenalty: 3 },
  { tier: "Extreme", strengthMultiplier: 5, encumbrancePenalty: 4 }
];

export function computeEncumbrance(draft: DraftActor, campaign: CampaignProfile): EncumbranceResult {
  const strength = draft.attributes.strength ?? campaign.attributeBaseline;

  let totalLoad = 0;
  for (const selection of draft.equipment) {
    if (getCarryState(selection) === "not_carried") continue;
    const item = getItem(selection.itemId);
    if (!item) continue;
    totalLoad += item.load * selection.quantity;
  }

  for (const { tier, strengthMultiplier, encumbrancePenalty } of TIERS) {
    if (totalLoad <= strengthMultiplier * strength) {
      return { totalLoad, strength, tier, encumbrancePenalty };
    }
  }
  return { totalLoad, strength, tier: "Overloaded", encumbrancePenalty: 5 };
}
