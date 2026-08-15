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
 * (v0.0.3-r1, 2026-08-12: re-synced to DR-0007's 3d10-under-Target mechanic
 * — baseline 4/range 3-6 became baseline 14/range 14-16, the system Granted
 * Baseline through the Trained benchmark tier. Starting Actors may not
 * reduce an Attribute below 14 here, so attributeMin equals attributeBaseline
 * and Step Down is a no-op for this campaign).
 */
export const CROWNSHARD_REALMS_CAMPAIGN: CampaignProfile = {
  id: core.id,
  name: core.name,
  startingPoints: 50,
  attributeBaseline: 14,
  attributeMin: 14,
  attributeMax: 16,
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
    "ITM-WPN-AXE-001", "ITM-WPN-GREAT-AXE-001", "ITM-WPN-HAND-AXE-001", "ITM-WPN-THROWING-AXE-001",
    "ITM-WPN-MACE-001", "ITM-WPN-SPEAR-001", "ITM-WPN-LONG-SPEAR-001", "ITM-WPN-PIKE-001",
    "ITM-WPN-GLAIVE-001", "ITM-WPN-HALBERD-001", "ITM-WPN-CLUB-WOOD-001",
    "ITM-WPN-HAND-CROSSBOW-001", "ITM-WPN-LIGHT-CROSSBOW-001", "ITM-WPN-HEAVY-CROSSBOW-001", "ITM-WPN-ARBALEST-001",
    "ITM-SHD-SMALL-001", "ITM-SHD-LARGE-001",
    "ITM-ARM-TORSO-PADDED-001", "ITM-ARM-HEAVY-PLATE-001",
    "ITM-ARM-ARMS-MAIL-001", "ITM-ARM-FEET-MAIL-001", "ITM-ARM-HANDS-MAIL-001",
    "ITM-ARM-HEAD-MAIL-001", "ITM-ARM-LEGS-MAIL-001", "ITM-ARM-TORSO-MAIL-001",
    "ITM-ARM-ARMS-SCALE-001", "ITM-ARM-FEET-SCALE-001", "ITM-ARM-HANDS-SCALE-001",
    "ITM-ARM-HEAD-SCALE-001", "ITM-ARM-LEGS-SCALE-001", "ITM-ARM-TORSO-SCALE-001",
    "ITM-ARM-ARMS-BRIGANDINE-001", "ITM-ARM-FEET-BRIGANDINE-001", "ITM-ARM-HANDS-BRIGANDINE-001",
    "ITM-ARM-HEAD-BRIGANDINE-001", "ITM-ARM-LEGS-BRIGANDINE-001", "ITM-ARM-TORSO-BRIGANDINE-001",
    "ITM-ARM-ARMS-PLATE-001", "ITM-ARM-FEET-PLATE-001", "ITM-ARM-HANDS-PLATE-001",
    "ITM-ARM-HEAD-PLATE-001", "ITM-ARM-LEGS-PLATE-001", "ITM-ARM-TORSO-PLATE-001",
    "ITM-CON-QUIVER-001", "ITM-AMMO-ARROW-TRAINING-001", "ITM-AMMO-BOLT-TRAINING-001", "ITM-AMMO-BOLT-WAR-001",
    "ITM-CON-BACKPACK-001", "ITM-CON-BACKPACK-CLOTH-001", "ITM-CON-BELT-POUCH-001", "ITM-CON-BELT-POUCH-CLOTH-001",
    "ITM-CON-WATERSKIN-001",
    "ITM-CON-TRAVEL-RATION-001", "ITM-RES-POTABLE-WATER-001", "ITM-SURV-TORCH-001"
  ]
};
