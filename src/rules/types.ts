import type { AttributeKey } from "./attributes";

export interface EquipmentSelection {
  itemId: string;
  quantity: number;
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
