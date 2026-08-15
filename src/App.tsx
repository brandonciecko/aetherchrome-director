import { useEffect, useState } from "react";
import { AVAILABLE_CAMPAIGNS, getCampaign } from "./rules/campaigns";
import { ATTRIBUTE_KEYS } from "./rules/attributes";
import { evaluateDraftActor } from "./rules/creation";
import { createBlankDraftActor, type DraftActor } from "./rules/types";
import { indexedDbActorStore } from "./storage/actor-store";
import { ActorImportError, exportActorToJSON, importActorFromJSON } from "./storage/export";
import { ActorCreator } from "./ui/ActorCreator/ActorCreator";
import { ConfirmDialog } from "./ui/components/ConfirmDialog";
import { VersionFooter } from "./ui/components/VersionFooter";
import "./App.css";

type View = { screen: "home" } | { screen: "creator"; actor: DraftActor };

export default function App() {
  const [actors, setActors] = useState<DraftActor[]>([]);
  const [view, setView] = useState<View>({ screen: "home" });
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState(AVAILABLE_CAMPAIGNS[0].id);
  const [pendingDelete, setPendingDelete] = useState<DraftActor | null>(null);
  const [pendingExport, setPendingExport] = useState<DraftActor | null>(null);

  async function refreshActors() {
    setActors(await indexedDbActorStore.list());
  }

  useEffect(() => {
    refreshActors();
  }, []);

  function handleNewActor() {
    const campaign = getCampaign(selectedCampaignId);
    if (!campaign) return;
    const draft = createBlankDraftActor(campaign.id, campaign.attributeBaseline, ATTRIBUTE_KEYS);
    setView({ screen: "creator", actor: draft });
  }

  function handleEditActor(actor: DraftActor) {
    setView({ screen: "creator", actor });
  }

  /** Returns null when the Actor's campaign can't be resolved (e.g. a stale/unknown campaignId). */
  function evaluateActor(actor: DraftActor) {
    const campaign = getCampaign(actor.campaignId);
    return campaign ? evaluateDraftActor(actor, campaign) : null;
  }

  function requestDeleteActor(actor: DraftActor) {
    setPendingDelete(actor);
  }

  async function confirmDeleteActor() {
    if (!pendingDelete) return;
    await indexedDbActorStore.delete(pendingDelete.id);
    setPendingDelete(null);
    await refreshActors();
  }

  function downloadActorExport(actor: DraftActor) {
    const json = exportActorToJSON(actor);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${actor.name || "actor"}.aetherchrome.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleExportActor(actor: DraftActor) {
    const result = evaluateActor(actor);
    if (result && !result.legal) {
      setPendingExport(actor);
      return;
    }
    downloadActorExport(actor);
  }

  function confirmExportActor() {
    if (!pendingExport) return;
    downloadActorExport(pendingExport);
    setPendingExport(null);
  }

  async function handleImportFile(file: File) {
    setImportError(null);
    try {
      const text = await file.text();
      const actor = importActorFromJSON(text);
      await indexedDbActorStore.save(actor);
      await refreshActors();
    } catch (error) {
      setImportError(error instanceof ActorImportError ? error.message : "Import failed.");
    }
  }

  async function handleDoneEditing() {
    setView({ screen: "home" });
    await refreshActors();
  }

  if (view.screen === "creator") {
    return <ActorCreator actor={view.actor} onDone={handleDoneEditing} />;
  }

  const visibleActors = actors.filter(actor => actor.campaignId === selectedCampaignId);

  return (
    <div className="home">
      <header>
        <h1>Aetherchrome Director</h1>
        <p className="subtitle">Actor Creator</p>
      </header>

      <div className="home-actions">
        <label className="campaign-select">
          Campaign
          <select value={selectedCampaignId} onChange={event => setSelectedCampaignId(event.target.value)}>
            {AVAILABLE_CAMPAIGNS.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleNewActor}>New Actor</button>
        <label className="import-button">
          Import Actor&hellip;
          <input
            type="file"
            accept="application/json"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) handleImportFile(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {importError && <p className="error">{importError}</p>}

      {actors.length === 0 ? (
        <p className="empty">No Actors yet. Create one to get started.</p>
      ) : visibleActors.length === 0 ? (
        <p className="empty">No Actors for {getCampaign(selectedCampaignId)?.name ?? "this campaign"} yet.</p>
      ) : (
        <ul className="actor-list">
          {visibleActors.map(actor => {
            const result = evaluateActor(actor);
            return (
              <li key={actor.id}>
                <div className="actor-summary">
                  <span className="actor-name">
                    {result && (
                      <span className={result.legal ? "validity-badge valid" : "validity-badge invalid"} title={result.legal ? "Legal" : "Not legal"}>
                        {result.legal ? "✓" : "✗"}
                      </span>
                    )}
                    {actor.name || "(unnamed)"}
                  </span>
                  <span className="actor-campaign">{getCampaign(actor.campaignId)?.name ?? "Unknown campaign"}</span>
                  <span className="actor-concept">{actor.concept}</span>
                </div>
                {result && (
                  <div className="actor-stats">
                    <span>
                      HP {result.derivedStats.maxHP} / MP {result.derivedStats.maxMP}
                    </span>
                    <span>
                      {result.pointLedger.totalPointsSpent} / {result.pointLedger.totalPointsSpent + result.pointLedger.pointsRemaining} pts
                    </span>
                  </div>
                )}
                <div className="actor-list-actions">
                  <button onClick={() => handleEditActor(actor)}>Edit</button>
                  <button onClick={() => handleExportActor(actor)}>Export</button>
                  <button onClick={() => requestDeleteActor(actor)}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <VersionFooter />

      {pendingDelete && (
        <ConfirmDialog
          title="Delete Actor?"
          message={`Delete "${pendingDelete.name || "(unnamed)"}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={confirmDeleteActor}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {pendingExport && (
        <ConfirmDialog
          title="Actor Isn't Legal"
          message={`"${pendingExport.name || "(unnamed)"}" doesn't currently pass validation. Export it anyway?`}
          confirmLabel="Continue Anyway"
          onConfirm={confirmExportActor}
          onCancel={() => setPendingExport(null)}
        />
      )}
    </div>
  );
}
