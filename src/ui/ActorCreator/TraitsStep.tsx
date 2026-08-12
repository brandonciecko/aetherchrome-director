import { TRAIT_REGISTRY, type TraitDefinition } from "../../rules/traits";
import type { CampaignProfile } from "../../rules/campaigns/crownshard-realms";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";

export function TraitsStep({
  draft,
  onChange,
  campaign
}: {
  draft: DraftActor;
  onChange: DraftUpdater;
  campaign: CampaignProfile;
}) {
  const available = TRAIT_REGISTRY.filter(trait => campaign.availableTraitIds.includes(trait.id));
  const advantages = available.filter(trait => trait.classification === "advantage");
  const disadvantages = available.filter(trait => trait.classification === "disadvantage");

  function setRank(traitId: string, rank: number) {
    onChange(d => {
      const traits = { ...d.traits };
      if (rank <= 0) {
        delete traits[traitId];
      } else {
        traits[traitId] = rank;
      }
      return { ...d, traits };
    });
  }

  function effectiveMaxRank(trait: TraitDefinition): number {
    if (trait.id === "TRT-ADV-EXTRA-HP") {
      return Math.min(trait.maxRank, draft.attributes.health ?? campaign.attributeBaseline);
    }
    return trait.maxRank;
  }

  function renderTrait(trait: TraitDefinition) {
    const rank = draft.traits[trait.id] ?? 0;
    const taken = rank > 0;
    const max = effectiveMaxRank(trait);
    const pointsLabel = trait.classification === "advantage" ? `${trait.costPerRank} pts/rank` : `${trait.costPerRank} pt refund/rank`;

    return (
      <li key={trait.id} className={`trait-card ${taken ? "taken" : ""}`}>
        <div className="trait-header">
          <span className="trait-name">{trait.name}</span>
          <span className="trait-cost">{pointsLabel}</span>
        </div>
        <p className="trait-effect">{trait.effectSummary}</p>
        <p className="trait-limit">{trait.limitNote}</p>
        {trait.ranked ? (
          <div className="rating-cell">
            <button disabled={rank <= 0} onClick={() => setRank(trait.id, rank - 1)}>
              -
            </button>
            <span className="rating-value">{rank}</span>
            <button disabled={rank >= max} onClick={() => setRank(trait.id, rank + 1)}>
              +
            </button>
          </div>
        ) : (
          <label className="trait-checkbox">
            <input type="checkbox" checked={taken} onChange={event => setRank(trait.id, event.target.checked ? 1 : 0)} />
            Take this Trait
          </label>
        )}
      </li>
    );
  }

  return (
    <div className="step traits-step">
      <h2>Traits</h2>
      <p>Disadvantage refunds are capped at {campaign.disadvantageRefundCap} points in this campaign.</p>

      <h3>Advantages</h3>
      <ul className="trait-grid">{advantages.map(renderTrait)}</ul>

      <h3>Disadvantages</h3>
      <ul className="trait-grid">{disadvantages.map(renderTrait)}</ul>
    </div>
  );
}
