import { useMemo, useState } from "react";
import { CROWNSHARD_REALMS_CAMPAIGN } from "../../rules/campaigns/crownshard-realms";
import { evaluateDraftActor } from "../../rules/creation";
import type { DraftActor } from "../../rules/types";
import { indexedDbActorStore } from "../../storage/actor-store";
import { PointLedger } from "../components/PointLedger";
import { ConceptStep } from "./ConceptStep";
import { AttributesStep } from "./AttributesStep";
import { SkillsStep } from "./SkillsStep";
import { TraitsStep } from "./TraitsStep";
import { EquipmentStep } from "./EquipmentStep";
import { ReviewStep } from "./ReviewStep";
import "./ActorCreator.css";

const STEPS = ["Concept", "Attributes", "Skills", "Traits", "Equipment", "Review"] as const;

export function ActorCreator({ actor, onDone }: { actor: DraftActor; onDone: () => void }) {
  const [draft, setDraft] = useState<DraftActor>(actor);
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  const result = useMemo(() => evaluateDraftActor(draft, CROWNSHARD_REALMS_CAMPAIGN), [draft]);

  function updateDraft(updater: (draft: DraftActor) => DraftActor) {
    setDraft(prev => updater(prev));
  }

  async function handleSave() {
    await indexedDbActorStore.save(draft);
    onDone();
  }

  return (
    <div className="actor-creator">
      <aside className="ledger-panel">
        <button className="back-button" onClick={onDone}>
          &larr; Back to Actors
        </button>
        <PointLedger campaign={CROWNSHARD_REALMS_CAMPAIGN} result={result} />
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
          {step === "Concept" && <ConceptStep draft={draft} onChange={updateDraft} />}
          {step === "Attributes" && <AttributesStep draft={draft} onChange={updateDraft} campaign={CROWNSHARD_REALMS_CAMPAIGN} />}
          {step === "Skills" && <SkillsStep draft={draft} onChange={updateDraft} campaign={CROWNSHARD_REALMS_CAMPAIGN} />}
          {step === "Traits" && <TraitsStep draft={draft} onChange={updateDraft} campaign={CROWNSHARD_REALMS_CAMPAIGN} />}
          {step === "Equipment" && (
            <EquipmentStep draft={draft} onChange={updateDraft} campaign={CROWNSHARD_REALMS_CAMPAIGN} result={result} />
          )}
          {step === "Review" && <ReviewStep draft={draft} result={result} onSave={handleSave} />}
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
