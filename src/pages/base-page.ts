import { UIActions } from '../core/ui-actions.js';

/**
 * Abstract blueprint for all Page Objects in the framework.
 * Focuses exclusively on providing child pages with access to the UIActions execution engine.
 * Fully decoupled from Playwright's native Page API.
 * @abstract
 */
export abstract class BasePage {
  /**
   * Dedicated UIActions engine instance scoped to this page's execution thread.
   * Provides concrete, thread-safe interaction routines for child Page Objects.
   * @protected
   */
  protected readonly actions: UIActions;

  /**
   * Initializes the base page by injecting the actions engine dependency.
   * @param {UIActions} actions - The pre-configured action engine instance for the current thread.
   */
  constructor(actions: UIActions) {
    this.actions = actions;
  }
}