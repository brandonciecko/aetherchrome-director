import { ITEM_REGISTRY } from "../../rules/items";
import type { CampaignProfile } from "../../rules/campaigns/crownshard-realms";
import type { CreationResult } from "../../rules/creation";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";

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

  return (
    <div className="step equipment-step">
      <h2>Equipment</h2>
      <p>
        Possession Allowance {campaign.startingPossessionAllowanceVU} VU. Spent so far: {result.equipmentLedger.vuSpent} VU.
        Unused allowance converts to Funds at {campaign.unusedAllowanceConversionRate * 100}% once you leave this step.
      </p>

      <table className="equipment-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Rating</th>
            <th>Load</th>
            <th>Price (VU)</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {available.map(item => {
            const quantity = quantityOf(item.id);
            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.itemRating}</td>
                <td>{item.load}</td>
                <td>{item.baseValueVU}</td>
                <td>
                  <button disabled={quantity <= 0} onClick={() => setQuantity(item.id, quantity - 1)}>
                    -
                  </button>
                  <span className="rating-value">{quantity}</span>
                  <button onClick={() => setQuantity(item.id, quantity + 1)}>+</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
