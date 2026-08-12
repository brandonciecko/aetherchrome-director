import { useState } from "react";
import {
  ATTRIBUTE_ABBREVIATIONS,
  ATTRIBUTE_DESCRIPTIONS,
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_STEP_DOWN_FLOOR,
  attributeCumulativeCost,
  type AttributeKey
} from "../../rules/attributes";
import type { CampaignProfile } from "../../rules/campaigns";
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
  const [selectedKey, setSelectedKey] = useState<AttributeKey | null>(null);

  function setAttribute(key: AttributeKey, rating: number) {
    onChange(d => ({ ...d, attributes: { ...d.attributes, [key]: rating } }));
  }

  function renderDetails() {
    if (!selectedKey) {
      return <p className="empty-hint">Select an Attribute to see details.</p>;
    }
    const rating = draft.attributes[selectedKey] ?? campaign.attributeBaseline;
    return (
      <div className="item-details">
        <h4>{ATTRIBUTE_LABELS[selectedKey]}</h4>
        <p>{ATTRIBUTE_DESCRIPTIONS[selectedKey]}</p>
        <p>
          Rating: {rating} (starting range {campaign.attributeMin}-{campaign.attributeMax})
        </p>
      </div>
    );
  }

  return (
    <div className="step attributes-step">
      <h2>Attributes</h2>
      <p>
        Starting range {campaign.attributeMin}-{campaign.attributeMax}, baseline {campaign.attributeBaseline}.
      </p>

      <div className="step-layout">
        <div className="attribute-grid">
          {ATTRIBUTE_KEYS.map(key => {
            const rating = draft.attributes[key] ?? campaign.attributeBaseline;
            const cost =
              Number.isInteger(rating) && rating >= ATTRIBUTE_STEP_DOWN_FLOOR
                ? attributeCumulativeCost(campaign.attributeBaseline, rating)
                : 0;

            return (
              <div
                key={key}
                className={`attribute-row ${key === selectedKey ? "selected" : ""}`}
                onClick={() => setSelectedKey(key)}
              >
                <span className="attribute-name" title={ATTRIBUTE_LABELS[key]}>
                  {ATTRIBUTE_ABBREVIATIONS[key]}
                </span>
                <button
                  disabled={rating <= campaign.attributeMin}
                  onClick={event => { event.stopPropagation(); setAttribute(key, rating - 1); }}
                >
                  -
                </button>
                <span className="rating-value">{rating}</span>
                <button
                  disabled={rating >= campaign.attributeMax}
                  onClick={event => { event.stopPropagation(); setAttribute(key, rating + 1); }}
                >
                  +
                </button>
                <span className="cost">{cost} pts</span>
              </div>
            );
          })}
        </div>
        <div className="pane details-pane">
          <h3>Details</h3>
          {renderDetails()}
        </div>
      </div>
    </div>
  );
}
