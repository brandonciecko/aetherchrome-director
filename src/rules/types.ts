import type { AttributeKey } from "./attributes";

/**
 * Whether an owned Item is actually being carried right now, and how
 * (source: AEC — Equipment System.md §8.1 — Ready/Worn/Held/Packed access
 * classes). "not_carried" means owned but left behind (e.g. at home base);
 * every other state counts toward Encumbrance (see rules/encumbrance.ts),
 * since Core's total-carried-Load rule doesn't exempt Stowed/packed gear.
 */
export type CarryState = "ready" | "worn" | "held" | "stowed" | "not_carried";
export const DEFAULT_CARRY_STATE: CarryState = "not_carried";

/**
 * Curated subset of Core's 11 Ownership States (04 Economy/AEC — Economic
 * System.md §16) — same curation philosophy as ITEM_REGISTRY: this is the
 * subset relevant to chargen equipment tracking, not every GM-adjudicated
 * edge state (Disputed, Jointly Owned, Stolen, Temporary are omitted).
 * "issued" | "institutional" | "loaned" | "entrusted" are the four states
 * TRT-ADV-INSTITUTIONAL-SUPPORT's own rule text names as its "supported"
 * resource ownership (see creation.ts's Institutional Support ledger);
 * "leased"/"rented" are treated as personally-arranged, not
 * institution-backed, and still cost Possession Allowance VU like "owned".
 */
export type OwnershipState = "owned" | "issued" | "institutional" | "loaned" | "leased" | "entrusted" | "rented";
export const DEFAULT_OWNERSHIP: OwnershipState = "owned";

export interface EquipmentSelection {
  itemId: string;
  quantity: number;
  /** Absent = DEFAULT_CARRY_STATE; read via getCarryState. */
  carryState?: CarryState;
  /** Absent = DEFAULT_OWNERSHIP; read via getOwnership. */
  ownership?: OwnershipState;
}

export function getCarryState(selection: EquipmentSelection): CarryState {
  return selection.carryState ?? DEFAULT_CARRY_STATE;
}

export function getOwnership(selection: EquipmentSelection): OwnershipState {
  return selection.ownership ?? DEFAULT_OWNERSHIP;
}

export interface DraftActor {
  id: string;
  campaignId: string;
  name: string;
  concept: string;
  attributes: Record<AttributeKey, number>;
  skills: Record<string, number>;
  traits: Record<string, number>;
  equipment: EquipmentSelection[];
}

export function createBlankDraftActor(
  campaignId: string,
  attributeBaseline: number,
  attributeKeys: readonly AttributeKey[]
): DraftActor {
  const attributes = {} as Record<AttributeKey, number>;
  for (const key of attributeKeys) {
    attributes[key] = attributeBaseline;
  }
  return {
    id: crypto.randomUUID(),
    campaignId,
    name: "",
    concept: "",
    attributes,
    skills: {},
    traits: {},
    equipment: []
  };
}
