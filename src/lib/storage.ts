// Browser-local persistence helper — acts as a lightweight client-side DB for the prototype.
// In production, replace these calls with REST/GraphQL requests to the Flask backend
// documented in docs/README.md.

const PREFIX = 'parksmart_db_';

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(
      `[parksmart_db] Failed to load "${key}" — using fallback.`,
      err
    );
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
  } catch (err) {
    console.warn('[parksmart_db] Failed to clear storage.', err);
  }
}