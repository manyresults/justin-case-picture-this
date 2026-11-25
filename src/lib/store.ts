// Tiny IndexedDB wrapper so /results survives a refresh (images are too big for sessionStorage).
export interface Session { photo: string; request: string; after: string | null }

const open = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("picture-this", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  try {
    const db = await open();
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction("kv", mode).objectStore("kv"));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined; // private mode etc. — app still works in memory
  }
}

export const loadSession = () => tx<Session>("readonly", (s) => s.get("session"));
export const saveSession = (v: Session) => tx("readwrite", (s) => s.put(v, "session"));
export const clearSession = () => tx("readwrite", (s) => s.delete("session"));
