import { describe, expect, it } from "vitest";
import { CROWNSHARD_REALMS_CAMPAIGN } from "../rules/campaigns/crownshard-realms";
import { ATTRIBUTE_KEYS } from "../rules/attributes";
import { createBlankDraftActor } from "../rules/types";
import { ActorImportError, exportActorToJSON, importActorFromJSON } from "./export";

describe("export/import round trip", () => {
  it("round-trips an actor's data exactly", () => {
    const draft = createBlankDraftActor(CROWNSHARD_REALMS_CAMPAIGN.id, CROWNSHARD_REALMS_CAMPAIGN.attributeBaseline, ATTRIBUTE_KEYS);
    draft.name = "Roundtrip Actor";
    draft.skills["SKL-FIGHT"] = 2;
    draft.equipment.push({ itemId: "ITM-WPN-DAGGER-001", quantity: 1 });

    const json = exportActorToJSON(draft);
    const imported = importActorFromJSON(json);

    expect(imported).toEqual(draft);
  });

  it("rejects a file that isn't valid JSON", () => {
    expect(() => importActorFromJSON("not json")).toThrow(ActorImportError);
  });

  it("rejects a file with an unsupported schema version", () => {
    const draft = createBlankDraftActor(CROWNSHARD_REALMS_CAMPAIGN.id, CROWNSHARD_REALMS_CAMPAIGN.attributeBaseline, ATTRIBUTE_KEYS);
    const json = JSON.stringify({ schemaVersion: 999, exportedAt: "now", actor: draft });
    expect(() => importActorFromJSON(json)).toThrow(/schema version/);
  });

  it("rejects an actor that fails current ruleset validation", () => {
    const draft = createBlankDraftActor(CROWNSHARD_REALMS_CAMPAIGN.id, CROWNSHARD_REALMS_CAMPAIGN.attributeBaseline, ATTRIBUTE_KEYS);
    draft.skills["SKL-FIGHT"] = 8; // exceeds the Crownshard Realms starting Skill max of 6
    const json = exportActorToJSON(draft);
    expect(() => importActorFromJSON(json)).toThrow(/ruleset validation/);
  });
});
