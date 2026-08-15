import type { CampaignProfile } from "../../rules/campaigns";
import type { CreationResult } from "../../rules/creation";
import type { DraftActor } from "../../rules/types";

export function ReviewStep({
  draft,
  result,
  campaign,
  onSave
}: {
  draft: DraftActor;
  result: CreationResult;
  campaign: CampaignProfile;
  onSave: () => void;
}) {
  return (
    <div className="step review-step">
      <h2>Review</h2>
      <h3>{draft.name || "(unnamed Actor)"}</h3>
      <p className="concept-preview">{draft.concept}</p>

      <dl className="derived-stats">
        <dt>Max HP</dt>
        <dd>{result.derivedStats.maxHP}</dd>
        <dt>Max MP</dt>
        <dd>{result.derivedStats.maxMP}</dd>
        <dt>Pressure Cap</dt>
        <dd>{result.derivedStats.pressureCap}</dd>
        <dt>Funds</dt>
        <dd>{result.equipmentLedger.totalFunds} VU</dd>
      </dl>

      {result.legal ? (
        <p className="status-legal">This Actor is legal for {campaign.name}. You can save it.</p>
      ) : (
        <div className="status-incomplete">
          <p>This Actor isn't legal yet:</p>
          <ul>
            {result.pointLedger.pointsRemaining !== 0 && <li>{result.pointLedger.pointsRemaining} character points remaining to spend.</li>}
            {result.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <button className="save-button" onClick={onSave}>
        Save Actor
      </button>
    </div>
  );
}
