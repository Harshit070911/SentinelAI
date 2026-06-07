import { createHash } from "crypto";

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

const cacheMap = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

function getMessageHash(message: string): string {
  return createHash("sha256")
    .update(message.trim().toLowerCase())
    .digest("hex");
}

export const AiCache = {
  /**
   * Retrieves an item from the cache if it exists and has not expired.
   */
  get<T>(message: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
    if (!message) return null;
    const hash = getMessageHash(message);
    const entry = cacheMap.get(hash);
    if (!entry) return null;

    // Check expiration
    if (Date.now() - entry.timestamp > ttlMs) {
      cacheMap.delete(hash);
      return null;
    }

    return entry.value as T;
  },

  /**
   * Stores an item in the cache.
   */
  set<T>(message: string, value: T): void {
    if (!message) return;
    const hash = getMessageHash(message);
    cacheMap.set(hash, {
      value,
      timestamp: Date.now(),
    });
  },

  /**
   * Clears all items in the cache.
   */
  clear(): void {
    cacheMap.clear();
  },
};
