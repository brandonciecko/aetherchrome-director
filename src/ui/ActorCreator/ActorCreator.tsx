import { useMemo, useState } from "react";
import { getCampaign } from "../../rules/campaigns";
import { evaluateDraftActor } from "../../rules/creation";
import type { DraftActor } from "../../rules/types";
import { indexedDbActorStore } from "../../storage/actor-store";
import { PointLedger } from "../components/PointLedger";
import { VersionFooter } from "../components/VersionFooter";
import { ConceptStep } from "./ConceptStep";
import { AttributesStep } from "./AttributesStep";
import { SkillsStep } from "./SkillsStep";
import { TraitsStep } from "./TraitsStep";
import { EquipmentStep } from "./EquipmentStep";
import { LoadoutStep } from "./LoadoutStep";
import { ReviewStep } from "./ReviewStep";
import "./ActorCreator.css";

const STEPS = ["Concept", "Attributes", "Skills", "Traits", "Equipment", "Loadout", "Review"] as const;

export function ActorCreator({ actor, onDone }: { actor: DraftActor; onDone: () => void }) {
  const [draft, setDraft] = useState<DraftActor>(actor);
  const [stepIndex, setStepIndex] = useState(0);
  const [justSaved, setJustSaved] = useState(false);
  const step = STEPS[stepIndex];

  // The campaign an Actor was created under travels with it (draft.campaignId),
  // set once at creation time (see App.tsx's New Actor campaign picker) — the
  // wizard itself doesn't let you change campaigns mid-creation.
  const campaign = getCampaign(draft.campaignId);
  if (!campaign) {
    throw new Error(`Actor targets unknown campaign "${draft.campaignId}"`);
  }

  const result = useMemo(() => evaluateDraftActor(draft, campaign), [draft, campaign]);

  function updateDraft(updater: (draft: DraftActor) => DraftActor) {
    setDraft(prev => updater(prev));
  }

  async function handleSave() {
    await indexedDbActorStore.save(draft);
    onDone();
  }

  // Saves progress without leaving the wizard, regardless of legality — the
  // Review step's handleSave (above) is the "finished, go home" action;
  // this is for saving partial work-in-progress from any step.
  async function handleSaveDraft() {
    await indexedDbActorStore.save(draft);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <div className="actor-creator">
      <aside className="ledger-panel">
        <div className="ledger-panel-header">
          <button className="back-button" onClick={onDone}>
            &larr; Back to Actors
          </button>
          <button className="save-draft-button" onClick={handleSaveDraft}>
            {justSaved ? "Saved" : "Save Draft"}
          </button>
        </div>
        <PointLedger campaign={campaign} result={result} />
        <VersionFooter />
      </aside>

      <main className="creator-main">
        <nav className="stepper">
          {STEPS.map((label, index) => (
            <button key={label} className={index === stepIndex ? "active" : ""} onClick={() => setStepIndex(index)}>
              {index + 1}. {label}
            </button>
          ))}
        </nav>

        <div className="step-content">
          {step === "Concept" && <ConceptStep draft={draft} onChange={updateDraft} campaign={campaign} />}
          {step === "Attributes" && <AttributesStep draft={draft} onChange={updateDraft} campaign={campaign} />}
          {step === "Skills" && <SkillsStep draft={draft} onChange={updateDraft} campaign={campaign} />}
          {step === "Traits" && <TraitsStep draft={draft} onChange={updateDraft} campaign={campaign} />}
          {step === "Equipment" && (
            <EquipmentStep draft={draft} onChange={updateDraft} campaign={campaign} result={result} />
          )}
          {step === "Loadout" && (
            <LoadoutStep draft={draft} onChange={updateDraft} campaign={campaign} result={result} />
          )}
          {step === "Review" && <ReviewStep draft={draft} result={result} campaign={campaign} onSave={handleSave} />}
        </div>

        <div className="step-nav">
          <button disabled={stepIndex === 0} onClick={() => setStepIndex(index => index - 1)}>
            Previous
          </button>
          <button disabled={stepIndex === STEPS.length - 1} onClick={() => setStepIndex(index => index + 1)}>
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
