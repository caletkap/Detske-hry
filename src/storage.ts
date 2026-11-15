// Jednoduché úložiště klíč–hodnota nad IndexedDB (data zůstávají jen v zařízení).

const DB_NAME = 'darky-pod-stromeckem';
const STORE = 'kv';
let dbp: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(d.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const idbGet = <T>(key: string) => run<T | undefined>('readonly', (s) => s.get(key));
export const idbSet = (key: string, value: unknown) => run<void>('readwrite', (s) => s.put(value, key));
export const idbDel = (key: string) => run<void>('readwrite', (s) => s.delete(key));
export const idbKeys = () => run<IDBValidKey[]>('readonly', (s) => s.getAllKeys()).then((k) => k.map(String));

/** Požádá prohlížeč, aby data (nahrávky, postup) nemazal při nedostatku místa. */
export function requestPersistence() {
  navigator.storage?.persist?.().catch(() => undefined);
}
