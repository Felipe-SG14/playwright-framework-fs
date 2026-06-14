import { Page } from '@playwright/test';
import { UIActions } from '../core/ui-actions.js';

/**
 * Abstract core Page Object Manager.
 * Centralizes the thread-safe initialization of the UIActions execution engine.
 * Must be extended by project-specific managers to expose concrete business pages.
 * @abstract
 */
export abstract class PageObjectManager {
  /**
   * The single UIActions engine instance dedicated to this worker thread.
   * @protected
   */
  protected readonly actions: UIActions;

  /**
   * Initializes the core manager by instantiating the actions engine with the thread's page context.
   * @param {Page} page - The native Playwright Page instance injected by the test context.
   */
  constructor(page: Page) {
    this.actions = new UIActions(page);
  }
}