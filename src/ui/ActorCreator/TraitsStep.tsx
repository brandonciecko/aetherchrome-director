import { TRAIT_REGISTRY, type TraitDefinition } from "../../rules/traits";
import type { CampaignProfile } from "../../rules/campaigns";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";
import { DualPaneSelector } from "../components/DualPaneSelector";

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
  const appliedTraits = available.filter(trait => (draft.traits[trait.id] ?? 0) > 0);
  const availableTraits = available.filter(trait => (draft.traits[trait.id] ?? 0) <= 0);

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

  function handleAdd(traitId: string) {
    const trait = available.find(t => t.id === traitId);
    if (!trait || (draft.traits[traitId] ?? 0) > 0) return;
    setRank(traitId, trait.minRank);
  }

  function handleRemove(traitId: string) {
    setRank(traitId, 0);
  }

  function pointsLabel(trait: TraitDefinition): string {
    return trait.classification === "advantage" ? `${trait.costPerRank} pts/rank` : `${trait.costPerRank} pt refund/rank`;
  }

  function renderCard(trait: TraitDefinition, { applied }: { applied: boolean }) {
    const rank = draft.traits[trait.id] ?? 0;
    const max = effectiveMaxRank(trait);

    return (
      <div className="dual-pane-card-content">
        <div className="card-header">
          <span className="card-name">{trait.name}</span>
          <span className={`card-tag ${trait.classification}`}>{trait.classification === "advantage" ? "Adv" : "Dis"}</span>
        </div>
        <span className="card-cost">{pointsLabel(trait)}</span>
        {applied && trait.ranked && (
          <div className="rating-cell" onClick={event => event.stopPropagation()}>
            <button disabled={rank <= trait.minRank} onClick={() => setRank(trait.id, rank - 1)}>
              -
            </button>
            <span className="rating-value">{rank}</span>
            <button disabled={rank >= max} onClick={() => setRank(trait.id, rank + 1)}>
              +
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderDetails(trait: TraitDefinition) {
    return (
      <div className="item-details">
        <h4>{trait.name}</h4>
        <p className="detail-cost">{pointsLabel(trait)}</p>
        <p>{trait.effectSummary}</p>
        <p className="detail-limit">{trait.limitNote}</p>
      </div>
    );
  }

  return (
    <div className="step traits-step">
      <h2>Traits</h2>
      <p>Disadvantage refunds are capped at {campaign.disadvantageRefundCap} points in this campaign.</p>

      <DualPaneSelector
        applied={appliedTraits}
        available={availableTraits}
        getId={trait => trait.id}
        onAdd={handleAdd}
        onRemove={handleRemove}
        appliedLabel="Applied Traits"
        availableLabel="Available Traits"
        renderCard={renderCard}
        renderDetails={renderDetails}
      />
    </div>
  );
}
