import { useEffect, useState } from "react";
import { AVAILABLE_CAMPAIGNS, getCampaign } from "./rules/campaigns";
import { ATTRIBUTE_KEYS } from "./rules/attributes";
import { createBlankDraftActor, type DraftActor } from "./rules/types";
import { indexedDbActorStore } from "./storage/actor-store";
import { ActorImportError, exportActorToJSON, importActorFromJSON } from "./storage/export";
import { ActorCreator } from "./ui/ActorCreator/ActorCreator";
import "./App.css";

type View = { screen: "home" } | { screen: "creator"; actor: DraftActor };

export default function App() {
  const [actors, setActors] = useState<DraftActor[]>([]);
  const [view, setView] = useState<View>({ screen: "home" });
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState(AVAILABLE_CAMPAIGNS[0].id);

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

  async function handleDeleteActor(id: string) {
    await indexedDbActorStore.delete(id);
    await refreshActors();
  }

  function handleExportActor(actor: DraftActor) {
    const json = exportActorToJSON(actor);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${actor.name || "actor"}.aetherchrome.json`;
    link.click();
    URL.revokeObjectURL(url);
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
      ) : (
        <ul className="actor-list">
          {actors.map(actor => (
            <li key={actor.id}>
              <div className="actor-summary">
                <span className="actor-name">{actor.name || "(unnamed)"}</span>
                <span className="actor-campaign">{getCampaign(actor.campaignId)?.name ?? "Unknown campaign"}</span>
                <span className="actor-concept">{actor.concept}</span>
              </div>
              <div className="actor-list-actions">
                <button onClick={() => handleEditActor(actor)}>Edit</button>
                <button onClick={() => handleExportActor(actor)}>Export</button>
                <button onClick={() => handleDeleteActor(actor.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
