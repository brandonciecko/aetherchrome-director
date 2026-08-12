export type TraitClassification = "advantage" | "disadvantage";

export interface TraitDefinition {
  id: string;
  name: string;
  classification: TraitClassification;
  /** Character points per rank for advantages, or refund points per rank for disadvantages. Always positive. */
  costPerRank: number;
  ranked: boolean;
  minRank: number;
  maxRank: number;
  /** Human-readable limit note (some max ranks are dynamic, e.g. tied to Base Health). */
  limitNote: string;
  effectSummary: string;
  incompatibleWith?: string[];
}

/**
 * Crownshard Realms Trait Catalog (source: AEC — Trait Core Rules v0.1 +
 * Crownshard Realms Trait Catalog v0.1). This is the subset of Core's Trait
 * Registry this app currently models full mechanics for — 13 Advantages, 3
 * Disadvantages, 16 total.
 *
 * IDs corrected 2026-08-11: these used to be Core's retired numeric IDs
 * (TRT-ADV-0002, ...) — Core renamed every Trait ID to a descriptive slug
 * (TRT-ADV-EXTRA-HP, ...) at some point after this catalog was hand-typed, and
 * the old IDs no longer resolve in aetherchrome-core-data at all. Only the IDs
 * were resynced here; cost/rank/effect text were not re-verified against Core
 * field-by-field in this pass (Core's `rank.maximum` is sometimes a dynamic
 * reference like "Base Health" rather than a plain number, which needs
 * per-trait judgment to translate into this module's numeric maxRank —
 * flagged as follow-up work, not resolved automatically here). Core's real
 * Crownshard Realms availability list (05 Campaigns/data/crownshard-realms/
 * availability/traits.yaml) is broader than this 16-entry catalog (27
 * entries) — the extra ones aren't modeled here yet either.
 */
export const TRAIT_REGISTRY: TraitDefinition[] = [
  {
    id: "TRT-ADV-EXTRA-HP",
    name: "Extra HP",
    classification: "advantage",
    costPerRank: 2,
    ranked: true,
    minRank: 1,
    maxRank: 9,
    limitNote: "ranks cannot exceed Base Health",
    effectSummary: "+1 Max HP per rank (does not change Current HP)."
  },
  {
    id: "TRT-ADV-NATURAL-ARMOR",
    name: "Natural Armor",
    classification: "advantage",
    costPerRank: 2,
    ranked: true,
    minRank: 1,
    maxRank: 3,
    limitNote: "max 3 ranks",
    effectSummary: "+1 persistent Armor per rank at all locations (highest value applies, no stacking)."
  },
  {
    id: "TRT-ADV-NATURAL-ATTACK",
    name: "Natural Attack",
    classification: "advantage",
    costPerRank: 2,
    ranked: true,
    minRank: 1,
    maxRank: 3,
    limitNote: "max 3 ranks, one location per instance",
    effectSummary: "+rank Effective Skill to Basic Melee Attack damage at that location; -rank Effective Skill to Manual-Dexterity Tasks at that location."
  },
  {
    id: "TRT-ADV-ACUTE-VISION",
    name: "Acute Vision",
    classification: "advantage",
    costPerRank: 2,
    ranked: true,
    minRank: 1,
    maxRank: 3,
    limitNote: "max 3 ranks",
    effectSummary: "+1 Effective Skill per rank on Visual-tagged Tasks.",
    incompatibleWith: ["TRT-DIS-IMPAIRED-VISION"]
  },
  {
    id: "TRT-ADV-ACUTE-HEARING",
    name: "Acute Hearing",
    classification: "advantage",
    costPerRank: 2,
    ranked: true,
    minRank: 1,
    maxRank: 3,
    limitNote: "max 3 ranks",
    effectSummary: "+1 Effective Skill per rank on Auditory-tagged Tasks.",
    incompatibleWith: ["TRT-DIS-IMPAIRED-HEARING"]
  },
  {
    id: "TRT-ADV-QUICK-REFLEXES",
    name: "Quick Reflexes",
    classification: "advantage",
    costPerRank: 3,
    ranked: false,
    minRank: 1,
    maxRank: 1,
    limitNote: "single purchase",
    effectSummary: "First Reflexive Task each Round generates no Pressure.",
    incompatibleWith: ["TRT-DIS-SLOW-REFLEXES"]
  },
  {
    id: "TRT-ADV-LONGSTRIDER",
    name: "Longstrider",
    classification: "advantage",
    costPerRank: 2,
    ranked: false,
    minRank: 1,
    maxRank: 1,
    limitNote: "single purchase",
    effectSummary: "+1 hex on qualifying Movement Tasks; costs 1 Pressure if used."
  },
  {
    id: "TRT-ADV-STRONG-ARMS",
    name: "Strong-Arms",
    classification: "advantage",
    costPerRank: 2,
    ranked: false,
    minRank: 1,
    maxRank: 1,
    limitNote: "single purchase",
    effectSummary: "Ignores Heavy-tag Pressure when the item is wielded in hand/arm."
  },
  {
    id: "TRT-ADV-MIGHTY-GRIP",
    name: "Mighty Grip",
    classification: "advantage",
    costPerRank: 3,
    ranked: false,
    minRank: 1,
    maxRank: 1,
    limitNote: "single purchase",
    effectSummary: "One-hand a normally two-handed weapon if Current STR >= (2 x Item Rating) + 1; loses the two-handed grip bonus."
  },
  {
    id: "TRT-ADV-QUICK-READY-BOW",
    name: "Quick Ready Bow",
    classification: "advantage",
    costPerRank: 2,
    ranked: false,
    minRank: 1,
    maxRank: 1,
    limitNote: "single purchase",
    effectSummary: "A successful Reload immediately bundles Draw Bow as the same Task (1 Pressure trigger)."
  },
  {
    id: "TRT-ADV-DEEP-CENTERING",
    name: "Deep Centering",
    classification: "advantage",
    costPerRank: 2,
    ranked: false,
    minRank: 1,
    maxRank: 1,
    limitNote: "single purchase",
    effectSummary: "A solo-Turn successful Center reduces 1 extra Pressure (max reduction 3)."
  },
  {
    id: "TRT-ADV-SHIELD-FAMILIARITY",
    name: "Shield Familiarity",
    classification: "advantage",
    costPerRank: 1,
    ranked: false,
    minRank: 1,
    maxRank: 1,
    limitNote: "single purchase",
    effectSummary: "The first Ready-Shield Task each Encounter is Automatic."
  },
  {
    id: "TRT-ADV-INSTITUTIONAL-SUPPORT",
    name: "Institutional Support",
    classification: "advantage",
    costPerRank: 2,
    ranked: true,
    minRank: 1,
    maxRank: 4,
    limitNote: "max rank 4, one Domain per instance, Alpha Domains only",
    effectSummary: "Grants Requisition access up to a VU value ceiling per rank (100/500/1,000/5,000 VU for ranks 1-4) within an Alpha Domain (Armor, Weapons & Shields, Ammo & Consumables, Field Equipment)."
  },
  {
    id: "TRT-DIS-IMPAIRED-VISION",
    name: "Impaired Vision",
    classification: "disadvantage",
    costPerRank: 2,
    ranked: true,
    minRank: 1,
    maxRank: 3,
    limitNote: "max 3 ranks",
    effectSummary: "-1 Effective Skill per rank on Visual-tagged Tasks.",
    incompatibleWith: ["TRT-ADV-ACUTE-VISION"]
  },
  {
    id: "TRT-DIS-IMPAIRED-HEARING",
    name: "Impaired Hearing",
    classification: "disadvantage",
    costPerRank: 2,
    ranked: true,
    minRank: 1,
    maxRank: 3,
    limitNote: "max 3 ranks",
    effectSummary: "-1 Effective Skill per rank on Auditory-tagged Tasks.",
    incompatibleWith: ["TRT-ADV-ACUTE-HEARING"]
  },
  {
    id: "TRT-DIS-SLOW-REFLEXES",
    name: "Slow Reflexes",
    classification: "disadvantage",
    costPerRank: 3,
    ranked: false,
    minRank: 1,
    maxRank: 1,
    limitNote: "single purchase",
    effectSummary: "The first Reflexive Task each Round generates +1 Pressure.",
    incompatibleWith: ["TRT-ADV-QUICK-REFLEXES"]
  }
];

const TRAIT_BY_ID = new Map(TRAIT_REGISTRY.map(trait => [trait.id, trait]));

export function getTrait(traitId: string): TraitDefinition | undefined {
  return TRAIT_BY_ID.get(traitId);
}
