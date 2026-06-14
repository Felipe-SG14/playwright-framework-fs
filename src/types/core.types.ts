/**
 * Standardized native Playwright synchronization states.
 */
export enum PlaywrightWaitState {
  ATTACHED = 'attached',
  DETACHED = 'detached',
  VISIBLE = 'visible',
  HIDDEN = 'hidden'
}

/**
 * Standardized framework timeout thresholds in milliseconds.
 */
export enum ElementTimeout {
  SHORT = 2000,
  DEFAULT = 5000,
  LONG = 10000,
  X_LONG = 30000
}