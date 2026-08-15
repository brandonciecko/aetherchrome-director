import { ATTRIBUTE_KEYS, ATTRIBUTE_STEP_DOWN_FLOOR, attributeCumulativeCost } from "./attributes";
import { SKILL_REGISTRY, skillCumulativeCost, validateSkillHierarchy } from "./skills";
import { getTrait } from "./traits";
import { getItem } from "./items";
import { getOwnership } from "./types";
import type { CampaignProfile } from "./campaigns";
import type { DraftActor, OwnershipState } from "./types";

export interface DerivedStats {
  maxHP: number;
  maxMP: number;
  pressureCap: number;
}

export interface PointLedger {
  attributePointsSpent: number;
  skillPointsSpent: number;
  advantagePointsSpent: number;
  disadvantageRefundUncapped: number;
  disadvantageRefund: number;
  netTraitPoints: number;
  totalPointsSpent: number;
  pointsRemaining: number;
}

export interface EquipmentLedger {
  vuSpent: number;
  allowanceRemaining: number;
  convertedFunds: number;
  totalFunds: number;
}

export interface InstitutionalLedger {
  rank: number;
  ceilingVU: number;
  spentVU: number;
  remainingVU: number;
}

export interface CreationResult {
  legal: boolean;
  issues: string[];
  pointLedger: PointLedger;
  equipmentLedger: EquipmentLedger;
  institutionalLedger: InstitutionalLedger;
  derivedStats: DerivedStats;
}

/**
 * VU ceiling by TRT-ADV-INSTITUTIONAL-SUPPORT rank (source: traits.ts's
 * TRT-ADV-INSTITUTIONAL-SUPPORT.effectSummary — Crownshard Realms
 * progression 100/500/1,000/5,000 VU for ranks 1-4).
 */
const INSTITUTIONAL_SUPPORT_CEILING_BY_RANK: Record<number, number> = { 1: 100, 2: 500, 3: 1000, 4: 5000 };

/**
 * Ownership States Core's Institutional Support Trait names as its
 * "supported" resource ownership ("Supported resources normally have
 * Issued, Institutional, Loaned, or Entrusted ownership"). Equipment in one
 * of these states is requisitioned via the Trait rather than personally
 * purchased, so it's exempt from the Possession Allowance and counted
 * against the Trait's VU ceiling instead (Economic System §21.4: "Issued
 * equipment does not consume personal Starting Possession Allowance").
 * Leased/Rented are treated as personally-arranged, not institution-backed,
 * and still cost Possession Allowance VU like Owned.
 */
const INSTITUTIONAL_OWNERSHIP_STATES: OwnershipState[] = ["issued", "institutional", "loaned", "entrusted"];

export function evaluateDraftActor(draft: DraftActor, campaign: CampaignProfile): CreationResult {
  const issues: string[] = [];

  let attributePointsSpent = 0;
  for (const key of ATTRIBUTE_KEYS) {
    const rating = draft.attributes[key] ?? campaign.attributeBaseline;
    // A rating below the ruleset's hard Step Down floor isn't costed at all (attributeCumulativeCost
    // throws there) — this shouldn't happen via the UI (which clamps to campaign.attributeMin), but a
    // stale/imported draft could carry one, so treat it as illegal and skip cost rather than crash.
    if (Number.isInteger(rating) && rating >= ATTRIBUTE_STEP_DOWN_FLOOR) {
      attributePointsSpent += attributeCumulativeCost(campaign.attributeBaseline, rating);
    } else {
      issues.push(`${key}: ${rating} is below the ruleset's Step Down floor (${ATTRIBUTE_STEP_DOWN_FLOOR}) and isn't costed`);
    }
    if (rating < campaign.attributeMin || rating > campaign.attributeMax) {
      issues.push(`${key}: ${rating} is outside the campaign's starting range (${campaign.attributeMin}-${campaign.attributeMax})`);
    }
  }

  let skillPointsSpent = 0;
  for (const [skillId, rating] of Object.entries(draft.skills)) {
    if (rating <= 0) continue;
    const skill = SKILL_REGISTRY.find(s => s.id === skillId);
    if (!skill) {
      issues.push(`Unknown skill id "${skillId}"`);
      continue;
    }
    if (!campaign.availableSkillIds.includes(skillId)) {
      issues.push(`${skill.name} is not available in ${campaign.name}`);
      continue;
    }
    if (rating > campaign.startingSkillMax) {
      issues.push(`${skill.name}: ${rating} exceeds the campaign starting Skill max (${campaign.startingSkillMax})`);
    }
    skillPointsSpent += skillCumulativeCost(rating);
  }
  issues.push(...validateSkillHierarchy(draft.skills, new Set(campaign.availableSkillIds)));

  const baseHealth = draft.attributes.health ?? campaign.attributeBaseline;
  const baseEssence = draft.attributes.essence ?? campaign.attributeBaseline;

  let advantagePointsSpent = 0;
  let disadvantageRefundUncapped = 0;
  const takenTraitIds = Object.entries(draft.traits)
    .filter(([, rank]) => rank > 0)
    .map(([id]) => id);

  for (const traitId of takenTraitIds) {
    const rank = draft.traits[traitId];
    const trait = getTrait(traitId);
    if (!trait) {
      issues.push(`Unknown trait id "${traitId}"`);
      continue;
    }
    if (!campaign.availableTraitIds.includes(traitId)) {
      issues.push(`${trait.name} is not available in ${campaign.name}`);
      continue;
    }
    if (!trait.ranked && rank !== 1) {
      issues.push(`${trait.name} is not ranked; it may only be taken at rank 1`);
    } else if (rank < trait.minRank || rank > trait.maxRank) {
      issues.push(`${trait.name}: rank ${rank} is outside its allowed range (${trait.minRank}-${trait.maxRank}, ${trait.limitNote})`);
    }
    if (traitId === "TRT-ADV-EXTRA-HP" && rank > baseHealth) {
      issues.push(`Extra HP: rank ${rank} cannot exceed Base Health (${baseHealth})`);
    }
    if (trait.incompatibleWith) {
      for (const otherId of trait.incompatibleWith) {
        if (takenTraitIds.includes(otherId)) {
          const other = getTrait(otherId);
          issues.push(`${trait.name} is incompatible with ${other?.name ?? otherId}`);
        }
      }
    }
    const cost = trait.costPerRank * rank;
    if (trait.classification === "advantage") {
      advantagePointsSpent += cost;
    } else {
      disadvantageRefundUncapped += cost;
    }
  }

  const disadvantageRefund = Math.min(disadvantageRefundUncapped, campaign.disadvantageRefundCap);
  if (disadvantageRefundUncapped > campaign.disadvantageRefundCap) {
    issues.push(
      `Disadvantage refunds (${disadvantageRefundUncapped}) exceed the campaign cap (${campaign.disadvantageRefundCap}); only ${campaign.disadvantageRefundCap} points are recovered`
    );
  }
  const netTraitPoints = advantagePointsSpent - disadvantageRefund;

  const totalPointsSpent = attributePointsSpent + skillPointsSpent + netTraitPoints;
  const pointsRemaining = campaign.startingPoints - totalPointsSpent;
  if (pointsRemaining < 0) {
    issues.push(`Over budget by ${-pointsRemaining} points`);
  }

  const institutionalRank = draft.traits["TRT-ADV-INSTITUTIONAL-SUPPORT"] ?? 0;

  let vuSpent = 0;
  let institutionalSpentVU = 0;
  for (const selection of draft.equipment) {
    const item = getItem(selection.itemId);
    if (!item) {
      issues.push(`Unknown item id "${selection.itemId}"`);
      continue;
    }
    if (!campaign.availableItemIds.includes(selection.itemId)) {
      issues.push(`${item.name} is not available in ${campaign.name}`);
      continue;
    }
    if (selection.quantity <= 0) {
      issues.push(`${item.name}: quantity must be positive`);
      continue;
    }
    const cost = item.baseValueVU * campaign.valueBias * selection.quantity;
    const ownership = getOwnership(selection);
    if (INSTITUTIONAL_OWNERSHIP_STATES.includes(ownership)) {
      if (institutionalRank === 0) {
        issues.push(`${item.name} is marked ${ownership} but the Actor has no Institutional Support`);
      }
      institutionalSpentVU += cost;
    } else {
      vuSpent += cost;
    }
  }
  const allowanceRemaining = campaign.startingPossessionAllowanceVU - vuSpent;
  if (allowanceRemaining < 0) {
    issues.push(`Equipment spending exceeds the Possession Allowance by ${(-allowanceRemaining).toFixed(2)} VU`);
  }
  // Assumption 2: rounding to the nearest whole VU is undocumented in the ruleset.
  const convertedFunds = Math.round(Math.max(0, allowanceRemaining) * campaign.unusedAllowanceConversionRate);
  const totalFunds = campaign.startingFundsVU + convertedFunds;

  const institutionalCeilingVU = INSTITUTIONAL_SUPPORT_CEILING_BY_RANK[institutionalRank] ?? 0;
  if (institutionalSpentVU > institutionalCeilingVU) {
    issues.push(
      `Institutional Support requisition spending (${institutionalSpentVU} VU) exceeds the rank ${institutionalRank} ceiling (${institutionalCeilingVU} VU)`
    );
  }

  const extraHPRanks = draft.traits["TRT-ADV-EXTRA-HP"] ?? 0;
  const maxHP = 2 * baseHealth + extraHPRanks;
  const maxMP = baseEssence;

  return {
    legal: issues.length === 0 && pointsRemaining === 0,
    issues,
    pointLedger: {
      attributePointsSpent,
      skillPointsSpent,
      advantagePointsSpent,
      disadvantageRefundUncapped,
      disadvantageRefund,
      netTraitPoints,
      totalPointsSpent,
      pointsRemaining
    },
    equipmentLedger: {
      vuSpent,
      allowanceRemaining,
      convertedFunds,
      totalFunds
    },
    institutionalLedger: {
      rank: institutionalRank,
      ceilingVU: institutionalCeilingVU,
      spentVU: institutionalSpentVU,
      remainingVU: institutionalCeilingVU - institutionalSpentVU
    },
    derivedStats: {
      maxHP,
      maxMP,
      pressureCap: campaign.pressureCap
    }
  };
}
