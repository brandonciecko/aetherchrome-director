import type { DraftActor } from "../../rules/types";

export type DraftUpdater = (updater: (draft: DraftActor) => DraftActor) => void;
