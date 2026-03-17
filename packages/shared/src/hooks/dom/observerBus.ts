/**
 * Shared MutationObserver bus.
 *
 * Instead of each hook/component creating its own MutationObserver on document.body,
 * this bus maintains a single observer per unique (target, options) combination.
 * Subscribers register callbacks that are batched via requestAnimationFrame.
 */

type Callback = () => void;

interface BusEntry {
  observer: MutationObserver;
  subscribers: Set<Callback>;
  rafId: number | null;
}

/**
 * Key: serialized target + options for deduplication.
 * In practice, the dominant case is document.body with childList+subtree.
 */
const buses = new Map<string, BusEntry>();

function makeKey(target: Node, options: MutationObserverInit): string {
  const parts = [
    target === document.body ? "body" : "other",
    options.childList ? "cl" : "",
    options.subtree ? "st" : "",
    options.attributes ? "at" : "",
    options.attributeFilter?.join(",") ?? "",
  ];
  return parts.join("|");
}

function getOrCreateBus(target: Node, options: MutationObserverInit): BusEntry {
  const key = makeKey(target, options);
  const existing = buses.get(key);
  if (existing) return existing;

  const entry: BusEntry = {
    observer: null as unknown as MutationObserver,
    subscribers: new Set(),
    rafId: null,
  };

  entry.observer = new MutationObserver(() => {
    // RAF batching: coalesce multiple mutations into a single callback round
    if (entry.rafId !== null) return;
    entry.rafId = requestAnimationFrame(() => {
      entry.rafId = null;
      for (const cb of entry.subscribers) {
        cb();
      }
    });
  });

  entry.observer.observe(target, options);
  buses.set(key, entry);
  return entry;
}

/**
 * Subscribe to DOM mutations on a target with given options.
 * The callback is RAF-batched — it won't fire more than once per frame.
 *
 * Returns an unsubscribe function. When the last subscriber leaves,
 * the underlying MutationObserver is disconnected and cleaned up.
 */
export function subscribeMutation(
  target: Node,
  options: MutationObserverInit,
  callback: Callback,
): () => void {
  const key = makeKey(target, options);
  const bus = getOrCreateBus(target, options);
  bus.subscribers.add(callback);

  return () => {
    bus.subscribers.delete(callback);
    if (bus.subscribers.size === 0) {
      if (bus.rafId !== null) {
        cancelAnimationFrame(bus.rafId);
      }
      bus.observer.disconnect();
      buses.delete(key);
    }
  };
}
