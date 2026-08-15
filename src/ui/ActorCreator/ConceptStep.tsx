import type { CampaignProfile } from "../../rules/campaigns";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";

/** A few sentences at most — Concept is flavor text, not a character biography. */
const CONCEPT_MAX_LENGTH = 300;

export function ConceptStep({
  draft,
  onChange,
  campaign
}: {
  draft: DraftActor;
  onChange: DraftUpdater;
  campaign: CampaignProfile;
}) {
  return (
    <div className="step concept-step">
      <h2>Concept</h2>
      <label>
        Name
        <input
          type="text"
          value={draft.name}
          onChange={event => {
            const value = event.target.value;
            onChange(d => ({ ...d, name: value }));
          }}
        />
      </label>
      <label>
        Concept
        <textarea
          rows={4}
          maxLength={CONCEPT_MAX_LENGTH}
          value={draft.concept}
          onChange={event => {
            const value = event.target.value;
            onChange(d => ({ ...d, concept: value }));
          }}
        />
        <span className="char-counter">
          {draft.concept.length} / {CONCEPT_MAX_LENGTH}
        </span>
      </label>
      <p className="campaign-note">Campaign: {campaign.name}</p>
    </div>
  );
}
