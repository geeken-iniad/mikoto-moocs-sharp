// Shared utility functions

export function isMoocsPage(): boolean {
  return window.location.hostname === 'moocs.iniad.org';
}

export function log(message: string, ...args: unknown[]): void {
  console.log(`[Mikoto MOOCs #] ${message}`, ...args);
}
