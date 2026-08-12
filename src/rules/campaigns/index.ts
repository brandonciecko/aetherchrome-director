import { CROWNSHARD_REALMS_CAMPAIGN } from "./crownshard-realms";
import { CORE_CAMPAIGN } from "./core";

export interface CampaignProfile {
  id: string;
  name: string;
  startingPoints: number;
  attributeBaseline: number;
  attributeMin: number;
  attributeMax: number;
  startingSkillMax: number;
  disadvantageRefundCap: number;
  pressureCap: number;
  startingPossessionAllowanceVU: number;
  startingFundsVU: number;
  /** Fraction of unused Possession Allowance converted to Funds after equipment selection. */
  unusedAllowanceConversionRate: number;
  /** No Value Biases are registered for either campaign; assume 1.0 (see plan Assumption 3). */
  valueBias: number;
  availableSkillIds: string[];
  availableTraitIds: string[];
  availableItemIds: string[];
}

/**
 * Campaigns selectable in the creator UI. Core also registers CMP-OIT, but
 * its own record says so itself: scope is "Everything [open]... No Actor
 * Creation controls, Wealth baseline, or setting content are established" —
 * OIT exists to prove the campaign-overlay pattern generalizes to a second
 * campaign, not as something a player should build a character against. Core
 * (CMP-CORE, added 2026-08-11) is different: it's a genuinely playable
 * "vanilla" baseline setting, not a stub, so it's registered here alongside
 * Crownshard Realms — see campaigns/core.ts. Crownshard Realms stays first
 * (and therefore the default selection, App.tsx's `AVAILABLE_CAMPAIGNS[0]`)
 * since it predates Core as this app's original campaign.
 */
export const AVAILABLE_CAMPAIGNS = [CROWNSHARD_REALMS_CAMPAIGN, CORE_CAMPAIGN];

const CAMPAIGN_BY_ID = new Map(AVAILABLE_CAMPAIGNS.map(campaign => [campaign.id, campaign]));

export function getCampaign(campaignId: string) {
  return CAMPAIGN_BY_ID.get(campaignId);
}
