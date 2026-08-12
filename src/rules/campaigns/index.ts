import { CROWNSHARD_REALMS_CAMPAIGN } from "./crownshard-realms";

export type { CampaignProfile } from "./crownshard-realms";

/**
 * Campaigns selectable in the creator UI. Core also registers CMP-OIT, but
 * its own record says so itself: scope is "Everything [open]... No Actor
 * Creation controls, Wealth baseline, or setting content are established" —
 * OIT exists to prove the campaign-overlay pattern generalizes to a second
 * campaign, not as something a player should build a character against.
 * Add a real second campaign here (its own file alongside
 * crownshard-realms.ts, registered in this array) once one has actual
 * content — not by exposing OIT as-is.
 */
export const AVAILABLE_CAMPAIGNS = [CROWNSHARD_REALMS_CAMPAIGN];

const CAMPAIGN_BY_ID = new Map(AVAILABLE_CAMPAIGNS.map(campaign => [campaign.id, campaign]));

export function getCampaign(campaignId: string) {
  return CAMPAIGN_BY_ID.get(campaignId);
}
