import { getCoreItem } from "./core-data";

export type ItemCategory = "Weapon" | "Armor / Protective" | "Container" | "Ammunition" | "Consumable" | "Survival";

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  /** Item Rating (Armor/weapon damage/shield-block contribution). */
  itemRating: number;
  /** Load in the ruleset's 0.25 increments. */
  load: number;
  /** Base Value in Value Units (VU) — Standard Price = Base Value x campaign Value Bias. */
  baseValueVU: number;
  /** Public/production-facing description of the Item (Core's `description` field). */
  description: string;
  notes?: string;
}

/** Core's item category slugs mapped to this app's display categories. */
const CORE_CATEGORY_LABELS: Record<string, ItemCategory> = {
  weapon: "Weapon",
  armor_protective: "Armor / Protective",
  container_load_bearing: "Container",
  ammunition_fuel_power: "Ammunition",
  consumable: "Consumable",
  survival: "Survival"
};

/**
 * A curated Crownshard Realms starting-equipment list. Core's per-campaign
 * item availability (05 Campaigns/data/crownshard-realms/availability/items.yaml)
 * is decided at the category level only, and explicitly states that category
 * approval does not imply approval of every Item in it — so this list, not an
 * automatic expansion of Core's category availability, is what stays curated
 * by hand. What no longer needs hand-typing is each item's own stats: those
 * are pulled live from Core (aetherchrome-core-data) below, since retyping
 * them had already drifted (e.g. Arming Sword's Item Rating was hand-set to 1
 * — a stale "spreadsheet inconsistency" workaround from before Core resolved
 * it to 2; Longsword and Dagger's Base Values had also drifted).
 */
const CURATED_ITEM_IDS: { id: string; notes?: string }[] = [
  { id: "ITM-WPN-ARMING-SWORD-001" },
  { id: "ITM-WPN-DAGGER-001" },
  { id: "ITM-WPN-KNIFE-001" },
  { id: "ITM-WPN-LONGSWORD-001" },
  { id: "ITM-WPN-GREATSWORD-001" },
  { id: "ITM-WPN-THROWING-KNIFE-001" },
  { id: "ITM-WPN-SHORT-BOW-001" },
  { id: "ITM-WPN-LONGBOW-001" },
  { id: "ITM-WPN-AXE-001" },
  { id: "ITM-WPN-GREAT-AXE-001" },
  { id: "ITM-WPN-HAND-AXE-001" },
  { id: "ITM-WPN-THROWING-AXE-001" },
  { id: "ITM-WPN-MACE-001" },
  { id: "ITM-WPN-SPEAR-001" },
  { id: "ITM-WPN-LONG-SPEAR-001" },
  { id: "ITM-WPN-PIKE-001" },
  { id: "ITM-WPN-GLAIVE-001" },
  { id: "ITM-WPN-HALBERD-001" },
  { id: "ITM-WPN-CLUB-WOOD-001" },
  { id: "ITM-WPN-HAND-CROSSBOW-001" },
  { id: "ITM-WPN-LIGHT-CROSSBOW-001" },
  { id: "ITM-WPN-HEAVY-CROSSBOW-001" },
  { id: "ITM-WPN-ARBALEST-001" },
  { id: "ITM-SHD-SMALL-001" },
  { id: "ITM-SHD-LARGE-001" },
  { id: "ITM-ARM-TORSO-PADDED-001" },
  { id: "ITM-ARM-HEAVY-PLATE-001" },
  { id: "ITM-ARM-ARMS-MAIL-001" },
  { id: "ITM-ARM-FEET-MAIL-001" },
  { id: "ITM-ARM-HANDS-MAIL-001" },
  { id: "ITM-ARM-HEAD-MAIL-001" },
  { id: "ITM-ARM-LEGS-MAIL-001" },
  { id: "ITM-ARM-TORSO-MAIL-001" },
  { id: "ITM-ARM-ARMS-SCALE-001" },
  { id: "ITM-ARM-FEET-SCALE-001" },
  { id: "ITM-ARM-HANDS-SCALE-001" },
  { id: "ITM-ARM-HEAD-SCALE-001" },
  { id: "ITM-ARM-LEGS-SCALE-001" },
  { id: "ITM-ARM-TORSO-SCALE-001" },
  { id: "ITM-ARM-ARMS-BRIGANDINE-001" },
  { id: "ITM-ARM-FEET-BRIGANDINE-001" },
  { id: "ITM-ARM-HANDS-BRIGANDINE-001" },
  { id: "ITM-ARM-HEAD-BRIGANDINE-001" },
  { id: "ITM-ARM-LEGS-BRIGANDINE-001" },
  { id: "ITM-ARM-TORSO-BRIGANDINE-001" },
  { id: "ITM-ARM-ARMS-PLATE-001" },
  { id: "ITM-ARM-FEET-PLATE-001" },
  { id: "ITM-ARM-HANDS-PLATE-001" },
  { id: "ITM-ARM-HEAD-PLATE-001" },
  { id: "ITM-ARM-LEGS-PLATE-001" },
  { id: "ITM-ARM-TORSO-PLATE-001" },
  { id: "ITM-CON-QUIVER-001", notes: "Capacity 20 arrows." },
  { id: "ITM-AMMO-ARROW-TRAINING-001", notes: "Aggregate Load; priced per arrow." },
  { id: "ITM-AMMO-BOLT-TRAINING-001", notes: "Aggregate Load; priced per bolt." },
  { id: "ITM-AMMO-BOLT-WAR-001", notes: "Aggregate Load; priced per bolt." },
  { id: "ITM-CON-BACKPACK-001", notes: "Capacity 6 Load + 2 external." },
  { id: "ITM-CON-BACKPACK-CLOTH-001", notes: "Capacity 6 Load + 2 external." },
  { id: "ITM-CON-BELT-POUCH-001", notes: "Capacity 1 Load." },
  { id: "ITM-CON-BELT-POUCH-CLOTH-001", notes: "Capacity 1 Load." },
  { id: "ITM-CON-WATERSKIN-001", notes: "Capacity 2 L." },
  { id: "ITM-CON-TRAVEL-RATION-001", notes: "Aggregate Load 0.5/ration; priced per ration." },
  { id: "ITM-RES-POTABLE-WATER-001", notes: "Aggregate Load 0.5/L; priced per liter." },
  { id: "ITM-SURV-TORCH-001", notes: "Aggregate Load 0.5/torch; priced per torch." }
];

function toItemDefinition(entry: { id: string; notes?: string }): ItemDefinition {
  const core = getCoreItem(entry.id);
  const category = CORE_CATEGORY_LABELS[core.category];
  if (!category) throw new Error(`Unmapped Core item category "${core.category}" for ${entry.id}`);
  const rawLoad = core.profiles.physical.load;
  return {
    id: core.id,
    name: core.name,
    category,
    itemRating: core.item_rating,
    // Aggregate-Load items (ammunition, rations, ...) carry a descriptive
    // load formula in Core rather than a flat number; treated as 0 load per
    // unit here, same as this list's prior hand-typed values.
    load: typeof rawLoad === "number" ? rawLoad : 0,
    baseValueVU: core.profiles.economic.base_value_vu,
    description: core.description,
    notes: entry.notes
  };
}

export const ITEM_REGISTRY: ItemDefinition[] = CURATED_ITEM_IDS.map(toItemDefinition);

const ITEM_BY_ID = new Map(ITEM_REGISTRY.map(item => [item.id, item]));

export function getItem(itemId: string): ItemDefinition | undefined {
  return ITEM_BY_ID.get(itemId);
}
