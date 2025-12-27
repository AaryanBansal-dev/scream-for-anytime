/**
 * OPT-IN IndexedDB Storage
 * 
 * PRIVACY GUARANTEE:
 * - This storage is COMPLETELY OPTIONAL and disabled by default
 * - User must EXPLICITLY opt-in to enable local persistence
 * - Data is stored ONLY on the user's device (IndexedDB is browser-local)
 * - No data is ever sent to any server
 * - User can delete all data at any time
 * 
 * This is provided for users who want their vents to persist across
 * browser sessions, but ONLY if they explicitly choose to enable it.
 */

import type { VentEntry, ScreamSession } from './memoryStore';

const DB_NAME = 'scream-therapy-db';
const DB_VERSION = 1;
const VENT_STORE = 'vent-entries';
const SCREAM_STORE = 'scream-sessions';

let db: IDBDatabase | null = null;
let isOptedIn = false;

/**
 * Check if user has opted into local storage
 */
export function isLocalStorageEnabled(): boolean {
  return isOptedIn;
}

/**
 * Enable local storage (user opt-in)
 * Returns a promise that resolves when IndexedDB is ready
 */
export async function enableLocalStorage(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    console.warn('IndexedDB is not available in this browser');
    return false;
  }

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB');
      resolve(false);
    };

    request.onsuccess = () => {
      db = request.result;
      isOptedIn = true;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!database.objectStoreNames.contains(VENT_STORE)) {
        const ventStore = database.createObjectStore(VENT_STORE, { keyPath: 'id' });
        ventStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!database.objectStoreNames.contains(SCREAM_STORE)) {
        const screamStore = database.createObjectStore(SCREAM_STORE, { keyPath: 'id' });
        screamStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Disable local storage and delete all data
 * PRIVACY: Complete data destruction
 */
export async function disableLocalStorage(): Promise<void> {
  isOptedIn = false;
  
  if (db) {
    db.close();
    db = null;
  }

  // Delete the entire database
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve();
      return;
    }

    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });
}

/**
 * Save a vent entry to IndexedDB (only if opted in)
 */
export async function saveVentEntry(entry: VentEntry): Promise<void> {
  if (!isOptedIn || !db) return;

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([VENT_STORE], 'readwrite');
    const store = transaction.objectStore(VENT_STORE);
    const request = store.add(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all vent entries from IndexedDB
 */
export async function getStoredVentEntries(): Promise<VentEntry[]> {
  if (!isOptedIn || !db) return [];

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([VENT_STORE], 'readonly');
    const store = transaction.objectStore(VENT_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a scream session to IndexedDB (only if opted in)
 */
export async function saveScreamSession(session: ScreamSession): Promise<void> {
  if (!isOptedIn || !db) return;

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([SCREAM_STORE], 'readwrite');
    const store = transaction.objectStore(SCREAM_STORE);
    const request = store.add(session);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all scream sessions from IndexedDB
 */
export async function getStoredScreamSessions(): Promise<ScreamSession[]> {
  if (!isOptedIn || !db) return [];

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([SCREAM_STORE], 'readonly');
    const store = transaction.objectStore(SCREAM_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all stored data (but keep opted in)
 */
export async function clearAllStoredData(): Promise<void> {
  if (!isOptedIn || !db) return;

  const transaction = db.transaction([VENT_STORE, SCREAM_STORE], 'readwrite');
  
  return new Promise((resolve) => {
    transaction.objectStore(VENT_STORE).clear();
    transaction.objectStore(SCREAM_STORE).clear();
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => resolve();
  });
}
