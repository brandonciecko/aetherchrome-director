import { getCoreCampaign } from "../core-data";
import { SKILL_REGISTRY } from "../skills";
import { TRAIT_REGISTRY } from "../traits";
import { ITEM_REGISTRY } from "../items";
import type { CampaignProfile } from "./index";

const CORE_CAMPAIGN_ID = "CMP-CORE";
const core = getCoreCampaign(CORE_CAMPAIGN_ID);

/**
 * The Core campaign profile (added 2026-08-11) — Aetherchrome-core's
 * baseline "vanilla" setting: unmodified Core rules with no campaign-specific
 * Skill/Trait/Item/Era/Supernatural restriction (AEC — Core Campaign.md).
 *
 * Unlike Crownshard Realms, Core deliberately carries zero
 * campaign_availability records at all (that's why getCoreCampaignAvailability
 * would throw for CMP-CORE) — Core's own rule is that the *absence* of an
 * availability record means every currently registered Skill, Trait, and
 * Item is available, so availableSkillIds/availableTraitIds/availableItemIds
 * below are simply "everything this app models," not a Core-derived
 * allowlist like Crownshard Realms' equipment list.
 *
 * id/startingSkillMax/disadvantageRefundCap/the economy baseline fields are
 * pulled live from Core below, same as Crownshard Realms. startingPoints
 * (40), attributeBaseline/Min/Max, and valueBias (1.0 — no Value Biases are
 * registered) are NOT yet structured Core registry fields — sourced from
 * "AEC — Core Campaign.md" §3 prose, the same gap noted on Crownshard
 * Realms. attributeBaseline/Min/Max updated 2026-08-12 (doc v0.1-r1) to
 * re-sync to DR-0007's 3d10-under-Target mechanic: the retired 1-9 scale's
 * midpoint-5 baseline becomes the system Granted Baseline of 14; Core
 * deliberately doesn't narrow the standard scale, so attributeMax is the
 * full open-ended ceiling (30, matching STANDARD_ATTRIBUTE_MAX) and
 * attributeMin is 10, the ruleset's Step Down floor — Core explicitly
 * permits reducing an Attribute to that floor for a refund during creation,
 * unlike Crownshard Realms.
 *
 * Assumption 5: Core's own rules (AEC — Encounter and Action-Time
 * Procedures.md §12.1) explicitly allow a campaign's Pressure Cap to be
 * unset ("the campaign configuration is incomplete and the value is NOT
 * VERIFIED") until a campaign source establishes one, and AEC — Core
 * Campaign.md doesn't set one. Director sets it to 5 here — distinct from
 * Crownshard Realms' narrower tactical-setting value of 4 — as a
 * placeholder pending a real decision recorded in Core.
 */
export const CORE_CAMPAIGN: CampaignProfile = {
  id: core.id,
  name: core.name,
  startingPoints: 40,
  attributeBaseline: 14,
  attributeMin: 10,
  attributeMax: 30,
  startingSkillMax: core.starting_skill_maximum,
  disadvantageRefundCap: core.disadvantage_refund_limit,
  pressureCap: 5,
  startingPossessionAllowanceVU: core.economy_baseline.starting_possession_allowance_vu,
  startingFundsVU: core.economy_baseline.starting_funds_vu,
  unusedAllowanceConversionRate: core.economy_baseline.unused_allowance_conversion_rate,
  valueBias: 1.0,
  availableSkillIds: SKILL_REGISTRY.map(skill => skill.id),
  availableTraitIds: TRAIT_REGISTRY.map(trait => trait.id),
  availableItemIds: ITEM_REGISTRY.map(item => item.id)
};
