/**
 * Safe local storage wrapper with in-memory fallback
 * Prevents DOMException / SecurityError crashes in cross-origin iframes (AI Studio preview, Safari private mode, etc.)
 */
const inMemoryFallback = new Map<string, string>();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In restricted iframe or disabled cookies
    }
    return inMemoryFallback.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // In restricted iframe or storage full
    }
    inMemoryFallback.set(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // In restricted iframe
    }
    inMemoryFallback.delete(key);
  },

  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // In restricted iframe
    }
    inMemoryFallback.clear();
  },
};
