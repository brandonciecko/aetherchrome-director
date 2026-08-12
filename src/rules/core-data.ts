/**
 * Thin typed access layer over Aetherchrome-core's generated registry data
 * (the aetherchrome-core-data package — see that repo's
 * "00 Governance/AEC — External Consumer Stability Contract.md" for what's
 * safe to depend on). Every other rules module should read Core data through
 * here rather than importing the JSON directly, so the raw-shape knowledge
 * lives in one place.
 *
 * Interfaces below only declare the fields this app actually reads — Core's
 * real records carry many more (authority, provenance, playtest notes, ...).
 */
import skillsFile from "aetherchrome-core-data/generated/json/skills.json";
import itemsFile from "aetherchrome-core-data/generated/json/items.json";
import campaignsFile from "aetherchrome-core-data/generated/json/campaigns.json";
import campaignAvailabilityFile from "aetherchrome-core-data/generated/json/campaign_availability.json";

export interface CoreSkillRecord {
  id: string;
  name: string;
  record_kind: "skill" | "specialization" | "technique";
  parent_skill_id?: string;
}

export interface CoreItemRecord {
  id: string;
  name: string;
  category: string;
  item_rating: number;
  profiles: {
    physical: { load: number | string };
    economic: { base_value_vu: number };
  };
}

export interface CoreCampaignRecord {
  id: string;
  name: string;
  starting_skill_maximum: number;
  disadvantage_refund_limit: number;
  economy_baseline: {
    starting_possession_allowance_vu: number;
    starting_funds_vu: number;
    unused_allowance_conversion_rate: number;
  };
}

export interface CoreCampaignAvailabilityRecord {
  id: string;
  campaign_id: string;
  target_record_type: "skill" | "trait" | "item";
  entries: { target_id: string; campaign_limit?: string }[];
}

export const CORE_SKILLS = skillsFile.records as unknown as CoreSkillRecord[];
export const CORE_ITEMS = itemsFile.records as unknown as CoreItemRecord[];
export const CORE_CAMPAIGNS = campaignsFile.records as unknown as CoreCampaignRecord[];
export const CORE_CAMPAIGN_AVAILABILITY = campaignAvailabilityFile.records as unknown as CoreCampaignAvailabilityRecord[];

export function getCoreCampaign(campaignId: string): CoreCampaignRecord {
  const campaign = CORE_CAMPAIGNS.find(c => c.id === campaignId);
  if (!campaign) throw new Error(`Unknown Core campaign id "${campaignId}"`);
  return campaign;
}

/** Ordered target IDs for one campaign's availability list of the given target type. */
export function getCoreCampaignAvailability(campaignId: string, targetRecordType: "skill" | "trait" | "item"): string[] {
  const record = CORE_CAMPAIGN_AVAILABILITY.find(
    a => a.campaign_id === campaignId && a.target_record_type === targetRecordType
  );
  if (!record) throw new Error(`No campaign_availability record for ${campaignId}/${targetRecordType}`);
  return record.entries.map(e => e.target_id);
}

export function getCoreItem(itemId: string): CoreItemRecord {
  const item = CORE_ITEMS.find(i => i.id === itemId);
  if (!item) throw new Error(`Unknown Core item id "${itemId}"`);
  return item;
}
