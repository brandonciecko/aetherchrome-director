import { getItem } from "../../rules/items";
import { computeEncumbrance } from "../../rules/encumbrance";
import { getCarryState, getOwnership, type CarryState, type OwnershipState } from "../../rules/types";
import type { CampaignProfile } from "../../rules/campaigns";
import type { CreationResult } from "../../rules/creation";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";

const CARRY_STATE_OPTIONS: { value: CarryState; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "worn", label: "Worn" },
  { value: "held", label: "Held" },
  { value: "stowed", label: "Stowed" },
  { value: "not_carried", label: "Not Carried" }
];

const OWNERSHIP_OPTIONS: { value: OwnershipState; label: string }[] = [
  { value: "owned", label: "Owned" },
  { value: "issued", label: "Issued" },
  { value: "institutional", label: "Institutional" },
  { value: "loaned", label: "Loaned" },
  { value: "leased", label: "Leased" },
  { value: "entrusted", label: "Entrusted" },
  { value: "rented", label: "Rented" }
];

export function LoadoutStep({
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
  const encumbrance = computeEncumbrance(draft, campaign);

  function setCarryState(itemId: string, carryState: CarryState) {
    onChange(d => ({
      ...d,
      equipment: d.equipment.map(selection => (selection.itemId === itemId ? { ...selection, carryState } : selection))
    }));
  }

  function setOwnership(itemId: string, ownership: OwnershipState) {
    onChange(d => ({
      ...d,
      equipment: d.equipment.map(selection => (selection.itemId === itemId ? { ...selection, ownership } : selection))
    }));
  }

  return (
    <div className="step loadout-step">
      <h2>Loadout</h2>
      <p>Configure how each owned Item is carried, and who owns it. Stowed gear still counts toward Encumbrance.</p>

      {draft.equipment.length === 0 ? (
        <p className="empty-hint">No Equipment owned yet — add some in the Equipment step first.</p>
      ) : (
        <div className="loadout-list">
          {draft.equipment.map(selection => {
            const item = getItem(selection.itemId);
            if (!item) return null;
            return (
              <div className="loadout-row" key={selection.itemId}>
                <div className="loadout-row-header">
                  <span className="card-name">{item.name}</span>
                  <span className="card-subtext">
                    &times;{selection.quantity} &middot; {item.load} Load each
                  </span>
                </div>
                <div className="loadout-controls">
                  <label>
                    Carry State
                    <select
                      value={getCarryState(selection)}
                      onChange={event => setCarryState(selection.itemId, event.target.value as CarryState)}
                    >
                      {CARRY_STATE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Ownership
                    <select
                      value={getOwnership(selection)}
                      onChange={event => setOwnership(selection.itemId, event.target.value as OwnershipState)}
                    >
                      {OWNERSHIP_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="loadout-summary">
        <div className="summary-block">
          <h3>Encumbrance</h3>
          <p>
            Total Load {encumbrance.totalLoad} / Strength {encumbrance.strength}
          </p>
          <p className="detail-cost">
            {encumbrance.tier} (EP {encumbrance.encumbrancePenalty})
          </p>
        </div>

        {result.institutionalLedger.rank > 0 && (
          <div className="summary-block">
            <h3>Institutional Support</h3>
            <p>
              Rank {result.institutionalLedger.rank} &middot; Ceiling {result.institutionalLedger.ceilingVU} VU
            </p>
            <p className={result.institutionalLedger.remainingVU < 0 ? "warn" : ""}>
              Spent {result.institutionalLedger.spentVU} VU &middot; Remaining {result.institutionalLedger.remainingVU} VU
            </p>
          </div>
        )}

        <div className="summary-block">
          <h3>Funds</h3>
          <dl>
            <dt>Starting Funds</dt>
            <dd>{campaign.startingFundsVU} VU</dd>
            <dt>Possession Allowance</dt>
            <dd>
              {result.equipmentLedger.vuSpent} / {campaign.startingPossessionAllowanceVU} VU
              <span className={result.equipmentLedger.allowanceRemaining < 0 ? "warn" : ""}>
                {" "}
                ({result.equipmentLedger.allowanceRemaining} VU remaining)
              </span>
            </dd>
            <dt>Converted to Funds</dt>
            <dd>{result.equipmentLedger.convertedFunds} VU</dd>
            <dt>Total Liquid Funds</dt>
            <dd>{result.equipmentLedger.totalFunds} VU</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
