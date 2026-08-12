import { getCampaign } from "../rules/campaigns";
import { evaluateDraftActor } from "../rules/creation";
import type { DraftActor } from "../rules/types";

export const ACTOR_EXPORT_SCHEMA_VERSION = 1;

export interface ActorExportFile {
  schemaVersion: number;
  exportedAt: string;
  actor: DraftActor;
}

export class ActorImportError extends Error {}

export function exportActorToJSON(actor: DraftActor): string {
  const file: ActorExportFile = {
    schemaVersion: ACTOR_EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    actor
  };
  return JSON.stringify(file, null, 2);
}

/**
 * Parses and re-validates an exported Actor against the current ruleset, so a
 * file made against a stale or future ruleset version fails loudly here
 * instead of silently corrupting saved data.
 */
export function importActorFromJSON(json: string): DraftActor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new ActorImportError("File is not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || !("schemaVersion" in parsed) || !("actor" in parsed)) {
    throw new ActorImportError("File is not a recognized Aetherchrome Director Actor export.");
  }

  const file = parsed as ActorExportFile;
  if (file.schemaVersion !== ACTOR_EXPORT_SCHEMA_VERSION) {
    throw new ActorImportError(
      `Unsupported export schema version ${file.schemaVersion} (this build reads version ${ACTOR_EXPORT_SCHEMA_VERSION}).`
    );
  }

  const actor = file.actor;
  const campaign = getCampaign(actor.campaignId);
  if (!campaign) {
    throw new ActorImportError(`Actor targets unknown campaign "${actor.campaignId}".`);
  }

  const result = evaluateDraftActor(actor, campaign);
  if (result.issues.length > 0) {
    throw new ActorImportError(`Imported Actor fails current ruleset validation: ${result.issues.join("; ")}`);
  }

  return actor;
}
