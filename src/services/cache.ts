const PREFIX = "mec3d_";

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "");
}

interface Entry<T> {
  data: T;
  expiresAt: number;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + sanitizeKey(key));
    if (!raw) return null;
    const entry: Entry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(PREFIX + sanitizeKey(key));
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  try {
    sessionStorage.setItem(
      PREFIX + sanitizeKey(key),
      JSON.stringify({ data, expiresAt: Date.now() + ttlMs }),
    );
  } catch {
    // storage quota exceeded or private browsing
  }
}

export function cacheDel(key: string): void {
  try {
    sessionStorage.removeItem(PREFIX + sanitizeKey(key));
  } catch {
    // storage quota exceeded or private browsing
  }
}
