const FETCH_TIMEOUT_MS = 7000;

const cacheMemoire = new Map<string, unknown>();

export async function fetchJsonAvecTimeout<T>(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function lireCache<T>(cle: string): T | null {
  if (!cacheMemoire.has(cle)) return null;
  return cacheMemoire.get(cle) as T;
}

export function ecrireCache<T>(cle: string, valeur: T): void {
  cacheMemoire.set(cle, valeur);
}
