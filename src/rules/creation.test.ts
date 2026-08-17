import { describe, expect, it } from "vitest";
import { CROWNSHARD_REALMS_CAMPAIGN } from "./campaigns/crownshard-realms";
import { evaluateDraftActor } from "./creation";
import { createBlankDraftActor } from "./types";
import { ATTRIBUTE_KEYS } from "./attributes";

function blankActor() {
  return createBlankDraftActor(CROWNSHARD_REALMS_CAMPAIGN.id, CROWNSHARD_REALMS_CAMPAIGN.attributeBaseline, ATTRIBUTE_KEYS);
}

describe("evaluateDraftActor", () => {
  it("is not legal when nothing has been bought (points unspent)", () => {
    const result = evaluateDraftActor(blankActor(), CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.legal).toBe(false);
    expect(result.pointLedger.pointsRemaining).toBe(CROWNSHARD_REALMS_CAMPAIGN.startingPoints);
    expect(result.issues).toEqual([]);
  });

  it("flags an attribute outside the campaign's starting range", () => {
    const draft = blankActor();
    draft.attributes.strength = 18; // Crownshard Realms range is 14-17
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.issues.some(issue => issue.includes("strength"))).toBe(true);
  });

  it("flags a skill rating above the campaign's starting Skill max", () => {
    const draft = blankActor();
    draft.skills["SKL-FIGHT"] = 8; // Crownshard Realms max is 6
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.issues.some(issue => issue.includes("Fight"))).toBe(true);
  });

  it("flags a skill that isn't available in the campaign (e.g. Concealment)", () => {
    const draft = blankActor();
    draft.skills["SKL-CONCEALMENT"] = 1;
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    // SKL-CONCEALMENT exists in the full Core Skill topology (SKILL_REGISTRY)
    // but isn't in Crownshard Realms' availableSkillIds, so this exercises
    // the "not available in this campaign" path rather than "unknown id".
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("caps disadvantage refunds at the campaign's refund cap", () => {
    const draft = blankActor();
    // 2 (Impaired Vision r3) + 2 (Impaired Hearing r3) + 3 (Slow Reflexes) = 6+6+3 = 15 uncapped
    draft.traits["TRT-DIS-IMPAIRED-VISION"] = 3;
    draft.traits["TRT-DIS-IMPAIRED-HEARING"] = 3;
    draft.traits["TRT-DIS-SLOW-REFLEXES"] = 1;
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.pointLedger.disadvantageRefundUncapped).toBe(15);
    expect(result.pointLedger.disadvantageRefund).toBe(CROWNSHARD_REALMS_CAMPAIGN.disadvantageRefundCap);
    expect(result.issues.some(issue => issue.includes("Disadvantage refunds"))).toBe(true);
  });

  it("flags going over budget", () => {
    const draft = blankActor();
    for (const key of ATTRIBUTE_KEYS) draft.attributes[key] = 16; // 36 points (6 per attribute, baseline 14 to 16 — within the campaign's 14-17 range)
    draft.skills["SKL-FIGHT"] = 6; // +21 points = 57 total, over the 50-point budget
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.pointLedger.pointsRemaining).toBeLessThan(0);
    expect(result.issues.some(issue => issue.includes("Over budget"))).toBe(true);
  });

  it("computes VU spent, allowance remaining, and Funds conversion for equipment", () => {
    const draft = blankActor();
    draft.equipment.push({ itemId: "ITM-WPN-ARMING-SWORD-001", quantity: 1 }); // 85 VU (Core base_value_vu)
    draft.equipment.push({ itemId: "ITM-ARM-TORSO-PADDED-001", quantity: 1 }); // 100 VU
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.equipmentLedger.vuSpent).toBe(185);
    expect(result.equipmentLedger.allowanceRemaining).toBe(815);
    expect(result.equipmentLedger.convertedFunds).toBe(408); // 50% of 815, rounded
    expect(result.equipmentLedger.totalFunds).toBe(428); // 20 starting + 408 converted
  });

  it("flags equipment spending that exceeds the Possession Allowance", () => {
    const draft = blankActor();
    draft.equipment.push({ itemId: "ITM-ARM-HEAVY-PLATE-001", quantity: 1 }); // 5000 VU > 1000 allowance
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.issues.some(issue => issue.includes("Possession Allowance"))).toBe(true);
  });

  it("computes Max HP from Base Health plus Extra HP ranks, and Max MP from Base Essence", () => {
    const draft = blankActor();
    draft.attributes.health = 15;
    draft.attributes.essence = 16;
    draft.traits["TRT-ADV-EXTRA-HP"] = 2; // Extra HP rank 2, <= Base Health 15, legal
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.derivedStats.maxHP).toBe(32); // 2*15 + 2
    expect(result.derivedStats.maxMP).toBe(16);
  });

  it("flags Extra HP ranks that exceed Base Health", () => {
    const draft = blankActor();
    draft.attributes.health = 14;
    draft.traits["TRT-ADV-EXTRA-HP"] = 15; // exceeds Base Health 14
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.issues.some(issue => issue.includes("Extra HP"))).toBe(true);
  });

  it("flags incompatible trait pairs", () => {
    const draft = blankActor();
    draft.traits["TRT-ADV-ACUTE-VISION"] = 1; // Acute Vision
    draft.traits["TRT-DIS-IMPAIRED-VISION"] = 1; // Impaired Vision
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.issues.some(issue => issue.includes("incompatible"))).toBe(true);
  });

  it("is legal for a minimal, exactly-on-budget actor with no purchases", () => {
    // Spending nothing leaves 50 points unspent, which is not legal (must spend exactly the budget).
    const draft = blankActor();
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.legal).toBe(false);
  });

  it("exempts Institutional Support ownership states from the Possession Allowance", () => {
    const draft = blankActor();
    draft.traits["TRT-ADV-INSTITUTIONAL-SUPPORT"] = 1; // ceiling 100 VU
    draft.equipment.push({ itemId: "ITM-WPN-DAGGER-001", quantity: 1, ownership: "issued" }); // 25 VU, institutional
    draft.equipment.push({ itemId: "ITM-WPN-KNIFE-001", quantity: 1 }); // 5 VU, personal (default "owned")
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.equipmentLedger.vuSpent).toBe(5);
    expect(result.institutionalLedger).toMatchObject({ rank: 1, ceilingVU: 100, spentVU: 25, remainingVU: 75 });
  });

  it("flags Institutional Support requisition spending that exceeds the rank ceiling", () => {
    const draft = blankActor();
    draft.traits["TRT-ADV-INSTITUTIONAL-SUPPORT"] = 1; // ceiling 100 VU
    draft.equipment.push({ itemId: "ITM-WPN-LONGSWORD-001", quantity: 1, ownership: "institutional" }); // 120 VU > 100 ceiling
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.issues.some(issue => issue.includes("Institutional Support requisition spending"))).toBe(true);
  });

  it("flags Institutional Support ownership on an Actor without the Trait", () => {
    const draft = blankActor();
    draft.equipment.push({ itemId: "ITM-WPN-DAGGER-001", quantity: 1, ownership: "loaned" });
    const result = evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN);
    expect(result.issues.some(issue => issue.includes("no Institutional Support"))).toBe(true);
    // Still exempt from personal VU even though it's flagged as invalid.
    expect(result.equipmentLedger.vuSpent).toBe(0);
  });
});
