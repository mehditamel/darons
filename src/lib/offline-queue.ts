// Offline mutation queue using localStorage
// Stores mutations when offline, replays them when back online

const QUEUE_KEY = "darons_offline_queue";

export interface OfflineMutation {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export function getOfflineQueue(): OfflineMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineMutation[]) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(action: string, payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const queue = getOfflineQueue();
  queue.push({
    id: crypto.randomUUID(),
    action,
    payload,
    timestamp: Date.now(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function removeFromOfflineQueue(id: string): void {
  if (typeof window === "undefined") return;
  const queue = getOfflineQueue().filter((m) => m.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

export function getOfflineQueueCount(): number {
  return getOfflineQueue().length;
}

// Replay all queued mutations by calling server actions
// Returns the number of successfully replayed mutations
export async function replayOfflineQueue(): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let replayed = 0;

  for (const mutation of queue) {
    try {
      // Dynamic import of the action module based on action name
      const response = await fetch("/api/offline-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mutation.action, payload: mutation.payload }),
      });

      if (response.ok) {
        removeFromOfflineQueue(mutation.id);
        replayed++;
      }
    } catch {
      // Stop replaying on network error — still offline
      break;
    }
  }

  return replayed;
}
