/**
 * Utility for catching errors in contexts where React Error Boundaries
 * cannot reach: event listeners, MutationObservers, timers, async effects.
 */

type ErrorHandler = (error: unknown, context: string) => void;

let globalErrorHandler: ErrorHandler = (error, context) => {
  console.error(`[GuardedEffect:${context}]`, error);
};

/**
 * Set a custom error handler for all guarded effects.
 */
export function setGuardedEffectHandler(handler: ErrorHandler) {
  globalErrorHandler = handler;
}

/**
 * Wrap a synchronous callback to catch and report errors.
 */
export function guarded<T extends (...args: unknown[]) => void>(
  fn: T,
  context: string,
): T {
  return ((...args: unknown[]) => {
    try {
      fn(...args);
    } catch (error) {
      globalErrorHandler(error, context);
    }
  }) as T;
}

/**
 * Wrap an async function to catch and report errors.
 */
export function guardedAsync<T extends (...args: unknown[]) => Promise<void>>(
  fn: T,
  context: string,
): T {
  return (async (...args: unknown[]) => {
    try {
      await fn(...args);
    } catch (error) {
      globalErrorHandler(error, context);
    }
  }) as T;
}
