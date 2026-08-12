import { getCoreCampaign, getCoreCampaignAvailability } from "../core-data";
import { TRAIT_REGISTRY } from "../traits";
import type { CampaignProfile } from "./index";

const CORE_CAMPAIGN_ID = "CMP-CROWNSHARD-REALMS";
const core = getCoreCampaign(CORE_CAMPAIGN_ID);

const modeledTraitIds = new Set(TRAIT_REGISTRY.map(trait => trait.id));

/**
 * The Crownshard Realms campaign profile (renamed 2026-08-05 from its working
 * codename "Alpha"/"Alpha 0.1" in Core — CMP-CROWNSHARD-REALMS is the current
 * canonical ID; this file used to be campaigns/alpha-01.ts and hardcoded the
 * old identity, which had gone stale relative to Core).
 *
 * id/name/startingSkillMax/disadvantageRefundCap/the economy baseline fields
 * and availableSkillIds/availableTraitIds are pulled live from Core
 * (aetherchrome-core-data) below. startingPoints, attributeBaseline,
 * attributeMin/Max, pressureCap, and valueBias are NOT yet structured Core
 * registry fields — they only exist in prose ("AEC — Crownshard Realms
 * Campaign.md") — so they stay hand-set here, sourced from that document
 * (v0.1 r12), same as before this file was rebuilt.
 */
export const CROWNSHARD_REALMS_CAMPAIGN: CampaignProfile = {
  id: core.id,
  name: core.name,
  startingPoints: 50,
  attributeBaseline: 4,
  attributeMin: 3,
  attributeMax: 6,
  startingSkillMax: core.starting_skill_maximum,
  disadvantageRefundCap: core.disadvantage_refund_limit,
  pressureCap: 4,
  startingPossessionAllowanceVU: core.economy_baseline.starting_possession_allowance_vu,
  startingFundsVU: core.economy_baseline.starting_funds_vu,
  unusedAllowanceConversionRate: core.economy_baseline.unused_allowance_conversion_rate,
  valueBias: 1.0,
  availableSkillIds: getCoreCampaignAvailability(CORE_CAMPAIGN_ID, "skill"),
  // Core's real availability list is broader (27 Traits) than TRAIT_REGISTRY's
  // 16 modeled entries (see traits.ts) — intersected here so this never
  // advertises a Trait the app can't yet look up cost/rank mechanics for.
  availableTraitIds: getCoreCampaignAvailability(CORE_CAMPAIGN_ID, "trait").filter(id => modeledTraitIds.has(id)),
  // Item availability in Core is category-level only and explicitly does not
  // imply approval of every Item in an approved category (see items.ts) —
  // this stays a hand-curated allowlist, not derived from Core.
  availableItemIds: [
    "ITM-WPN-ARMING-SWORD-001", "ITM-WPN-DAGGER-001", "ITM-WPN-KNIFE-001", "ITM-WPN-LONGSWORD-001",
    "ITM-WPN-GREATSWORD-001", "ITM-WPN-THROWING-KNIFE-001", "ITM-WPN-SHORT-BOW-001", "ITM-WPN-LONGBOW-001",
    "ITM-SHD-SMALL-001", "ITM-SHD-LARGE-001",
    "ITM-ARM-TORSO-PADDED-001", "ITM-ARM-HEAVY-PLATE-001",
    "ITM-CON-QUIVER-001", "ITM-AMMO-ARROW-TRAINING-001",
    "ITM-CON-BACKPACK-001", "ITM-CON-BELT-POUCH-001", "ITM-CON-WATERSKIN-001",
    "ITM-CON-TRAVEL-RATION-001", "ITM-RES-POTABLE-WATER-001", "ITM-SURV-TORCH-001"
  ]
};
