import { describe, expect, it } from "vitest";
import { CROWNSHARD_REALMS_CAMPAIGN } from "./campaigns/crownshard-realms";
import { computeEncumbrance } from "./encumbrance";
import { createBlankDraftActor } from "./types";
import { ATTRIBUTE_KEYS } from "./attributes";

function blankActor() {
  return createBlankDraftActor(CROWNSHARD_REALMS_CAMPAIGN.id, CROWNSHARD_REALMS_CAMPAIGN.attributeBaseline, ATTRIBUTE_KEYS);
}

// ITM-WPN-DAGGER-001 has a flat Load of 0.25 (Core base_value data), used here
// as a precise Load unit to hit exact tier boundaries via quantity.
const DAGGER_ID = "ITM-WPN-DAGGER-001";

describe("computeEncumbrance", () => {
  it("only counts carried (non-'not_carried') equipment toward Load", () => {
    const draft = blankActor();
    draft.attributes.strength = 10;
    draft.equipment.push({ itemId: DAGGER_ID, quantity: 4, carryState: "ready" }); // 1.0 Load, carried
    draft.equipment.push({ itemId: "ITM-ARM-TORSO-PADDED-001", quantity: 1 }); // owned but not_carried by default
    const result = computeEncumbrance(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.totalLoad).toBe(1);
  });

  it("counts Stowed items toward Load, same as Ready/Worn/Held", () => {
    const draft = blankActor();
    draft.attributes.strength = 10;
    draft.equipment.push({ itemId: DAGGER_ID, quantity: 4, carryState: "stowed" });
    const result = computeEncumbrance(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.totalLoad).toBe(1);
  });

  it("is None exactly at the Strength threshold, Light just above it", () => {
    const draft = blankActor();
    draft.attributes.strength = 1;

    draft.equipment = [{ itemId: DAGGER_ID, quantity: 4, carryState: "ready" }]; // Load 1.0 == 1x Strength
    expect(computeEncumbrance(draft, CROWNSHARD_REALMS_CAMPAIGN)).toMatchObject({ tier: "None", encumbrancePenalty: 0 });

    draft.equipment = [{ itemId: DAGGER_ID, quantity: 5, carryState: "ready" }]; // Load 1.25 > 1x Strength
    expect(computeEncumbrance(draft, CROWNSHARD_REALMS_CAMPAIGN)).toMatchObject({ tier: "Light", encumbrancePenalty: 1 });
  });

  it("computes Medium and Heavy tiers", () => {
    const draft = blankActor();
    draft.attributes.strength = 1;

    draft.equipment = [{ itemId: DAGGER_ID, quantity: 12, carryState: "ready" }]; // Load 3.0 == 3x Strength
    expect(computeEncumbrance(draft, CROWNSHARD_REALMS_CAMPAIGN)).toMatchObject({ tier: "Medium", encumbrancePenalty: 2 });

    draft.equipment = [{ itemId: DAGGER_ID, quantity: 13, carryState: "ready" }]; // Load 3.25 > 3x Strength
    expect(computeEncumbrance(draft, CROWNSHARD_REALMS_CAMPAIGN)).toMatchObject({ tier: "Heavy", encumbrancePenalty: 3 });
  });

  it("is Extreme exactly at 5x Strength, Overloaded just above it", () => {
    const draft = blankActor();
    draft.attributes.strength = 1;

    draft.equipment = [{ itemId: DAGGER_ID, quantity: 20, carryState: "ready" }]; // Load 5.0 == 5x Strength
    expect(computeEncumbrance(draft, CROWNSHARD_REALMS_CAMPAIGN)).toMatchObject({ tier: "Extreme", encumbrancePenalty: 4 });

    draft.equipment = [{ itemId: DAGGER_ID, quantity: 21, carryState: "ready" }]; // Load 5.25 > 5x Strength
    expect(computeEncumbrance(draft, CROWNSHARD_REALMS_CAMPAIGN)).toMatchObject({ tier: "Overloaded", encumbrancePenalty: 5 });
  });
});
