import type { CampaignProfile } from "../../rules/campaigns";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";

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
          value={draft.concept}
          onChange={event => {
            const value = event.target.value;
            onChange(d => ({ ...d, concept: value }));
          }}
        />
      </label>
      <p className="campaign-note">Campaign: {campaign.name}</p>
    </div>
  );
}
