import type { CampaignProfile } from "../../rules/campaigns";
import type { CreationResult } from "../../rules/creation";

export function PointLedger({ campaign, result }: { campaign: CampaignProfile; result: CreationResult }) {
  const { pointLedger, equipmentLedger, derivedStats, legal, issues } = result;

  return (
    <div className="point-ledger">
      <h3>Point Ledger</h3>
      <dl>
        <dt>Character Points</dt>
        <dd>
          {pointLedger.totalPointsSpent} / {campaign.startingPoints} spent
          <span className={pointLedger.pointsRemaining < 0 ? "warn" : ""}> ({pointLedger.pointsRemaining} remaining)</span>
        </dd>
        <dt>Possession Allowance</dt>
        <dd>
          {equipmentLedger.vuSpent} / {campaign.startingPossessionAllowanceVU} VU
          <span className={equipmentLedger.allowanceRemaining < 0 ? "warn" : ""}> ({equipmentLedger.allowanceRemaining} VU remaining)</span>
        </dd>
        <dt>Funds</dt>
        <dd>{equipmentLedger.totalFunds} VU (assumed rounding on conversion)</dd>
        <dt>Max HP / Max MP</dt>
        <dd>{derivedStats.maxHP} / {derivedStats.maxMP}</dd>
        <dt>Pressure Cap</dt>
        <dd>{derivedStats.pressureCap}</dd>
      </dl>

      <p className={legal ? "status-legal" : "status-incomplete"}>
        {legal ? `Legal ${campaign.name} Actor` : "Not yet a legal Actor"}
      </p>

      {issues.length > 0 && (
        <ul className="issue-list">
          {issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
