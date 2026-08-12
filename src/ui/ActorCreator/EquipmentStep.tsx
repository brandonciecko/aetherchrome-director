import { ITEM_REGISTRY, type ItemDefinition } from "../../rules/items";
import type { CampaignProfile } from "../../rules/campaigns";
import type { CreationResult } from "../../rules/creation";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";
import { DualPaneSelector } from "../components/DualPaneSelector";

export function EquipmentStep({
  draft,
  onChange,
  campaign,
  result
}: {
  draft: DraftActor;
  onChange: DraftUpdater;
  campaign: CampaignProfile;
  result: CreationResult;
}) {
  const available = ITEM_REGISTRY.filter(item => campaign.availableItemIds.includes(item.id));

  function quantityOf(itemId: string): number {
    return draft.equipment.find(selection => selection.itemId === itemId)?.quantity ?? 0;
  }

  function setQuantity(itemId: string, quantity: number) {
    onChange(d => {
      const equipment = d.equipment.filter(selection => selection.itemId !== itemId);
      if (quantity > 0) {
        equipment.push({ itemId, quantity });
      }
      return { ...d, equipment };
    });
  }

  const appliedItems = available.filter(item => quantityOf(item.id) > 0);
  const availableItems = available.filter(item => quantityOf(item.id) <= 0);

  function handleAdd(itemId: string) {
    if (quantityOf(itemId) > 0) return;
    setQuantity(itemId, 1);
  }

  function handleRemove(itemId: string) {
    setQuantity(itemId, 0);
  }

  function renderCard(item: ItemDefinition, { applied }: { applied: boolean }) {
    const quantity = quantityOf(item.id);

    return (
      <div className="dual-pane-card-content">
        <div className="card-header">
          <span className="card-name">{item.name}</span>
          <span className="card-cost">{item.baseValueVU} VU</span>
        </div>
        <span className="card-subtext">{item.category}</span>
        {applied && (
          <div className="rating-cell" onClick={event => event.stopPropagation()}>
            <button disabled={quantity <= 1} onClick={() => setQuantity(item.id, quantity - 1)}>
              -
            </button>
            <span className="rating-value">{quantity}</span>
            <button onClick={() => setQuantity(item.id, quantity + 1)}>+</button>
          </div>
        )}
      </div>
    );
  }

  function renderDetails(item: ItemDefinition) {
    return (
      <div className="item-details">
        <h4>{item.name}</h4>
        <p>{item.description}</p>
        <p className="detail-cost">{item.baseValueVU} VU</p>
        <p>Category: {item.category}</p>
        <p>Item Rating: {item.itemRating}</p>
        <p>Load: {item.load}</p>
        {item.notes && <p className="detail-limit">{item.notes}</p>}
      </div>
    );
  }

  return (
    <div className="step equipment-step">
      <h2>Equipment</h2>
      <p>
        Possession Allowance {campaign.startingPossessionAllowanceVU} VU. Spent so far: {result.equipmentLedger.vuSpent} VU.
        Unused allowance converts to Funds at {campaign.unusedAllowanceConversionRate * 100}% once you leave this step.
      </p>

      <DualPaneSelector
        applied={appliedItems}
        available={availableItems}
        getId={item => item.id}
        onAdd={handleAdd}
        onRemove={handleRemove}
        appliedLabel="Carried"
        availableLabel="Available"
        renderCard={renderCard}
        renderDetails={renderDetails}
      />
    </div>
  );
}
