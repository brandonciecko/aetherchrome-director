import type { DraftActor } from "../rules/types";

/**
 * Storage abstraction for saved Actor drafts. Call sites depend on this
 * interface, not IndexedDB directly, so a future sync backend can swap in
 * without touching rules/UI code.
 */
export interface ActorStore {
  list(): Promise<DraftActor[]>;
  save(actor: DraftActor): Promise<void>;
  delete(id: string): Promise<void>;
}

const DB_NAME = "aetherchrome-director";
const DB_VERSION = 1;
const STORE_NAME = "actors";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = run(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const indexedDbActorStore: ActorStore = {
  async list() {
    return withStore("readonly", store => store.getAll());
  },
  async save(actor) {
    await withStore("readwrite", store => store.put(actor));
  },
  async delete(id) {
    await withStore("readwrite", store => store.delete(id));
  }
};
