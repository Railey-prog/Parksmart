// Browser-local persistence helper — acts as a lightweight client-side DB for the prototype.
// In production, replace these calls with REST/GraphQL requests to the backend.

const PREFIX = 'parksmart_db_';
const STORAGE_VERSION = '4'; // bump this to force-clear stale localStorage on all clients
const VERSION_KEY = PREFIX + '__version__';

// On first load, if the stored version doesn't match, wipe all parksmart data
// so mockData changes always take effect cleanly.
(function initStorageVersion() {
  try {
    const stored = localStorage.getItem(VERSION_KEY);
    if (stored !== STORAGE_VERSION) {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
      keys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  } catch {
    // ignore
  }
})();

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[parksmart_db] Failed to load "${key}" — using fallback.`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[parksmart_db] Failed to save "${key}".`, err);
  }
}

export function clearAllStorage(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  } catch (err) {
    console.warn('[parksmart_db] Failed to clear storage.', err);
  }
}
