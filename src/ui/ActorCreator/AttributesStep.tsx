import { ATTRIBUTE_ABBREVIATIONS, ATTRIBUTE_KEYS, ATTRIBUTE_LABELS, attributeCumulativeCost } from "../../rules/attributes";
import type { CampaignProfile } from "../../rules/campaigns/crownshard-realms";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";

export function AttributesStep({
  draft,
  onChange,
  campaign
}: {
  draft: DraftActor;
  onChange: DraftUpdater;
  campaign: CampaignProfile;
}) {
  function setAttribute(key: (typeof ATTRIBUTE_KEYS)[number], rating: number) {
    onChange(d => ({ ...d, attributes: { ...d.attributes, [key]: rating } }));
  }

  return (
    <div className="step attributes-step">
      <h2>Attributes</h2>
      <p>
        Starting range {campaign.attributeMin}-{campaign.attributeMax}, baseline {campaign.attributeBaseline}.
      </p>

      <div className="attribute-grid">
        {ATTRIBUTE_KEYS.map(key => {
          const rating = draft.attributes[key] ?? campaign.attributeBaseline;
          const cost =
            rating >= campaign.attributeBaseline ? attributeCumulativeCost(campaign.attributeBaseline, rating) : 0;

          return (
            <div key={key} className="attribute-row">
              <span className="attribute-name" title={ATTRIBUTE_LABELS[key]}>
                {ATTRIBUTE_ABBREVIATIONS[key]}
              </span>
              <button disabled={rating <= campaign.attributeMin} onClick={() => setAttribute(key, rating - 1)}>
                -
              </button>
              <span className="rating-value">{rating}</span>
              <button disabled={rating >= campaign.attributeMax} onClick={() => setAttribute(key, rating + 1)}>
                +
              </button>
              <span className="cost">{cost} pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
