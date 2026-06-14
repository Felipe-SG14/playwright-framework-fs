import { PlaywrightWaitState, ElementTimeout } from '../types/index.js';

/**
 * Immutable Data Transfer Object (DTO) that defines a UI component's selector strategy,
 * its required synchronization state, and its maximum allowed waiting threshold.
 * Fully safe for high-concurrency parallel test execution.
 */
export class UIElement {
  private readonly _selector: string;
  private readonly _waitState: PlaywrightWaitState;
  private readonly _timeout: ElementTimeout;

  /**
   * Initializes a complete element definition configuration.
   * @param {string} selector - The raw locator template (supports single or multiple '?' tokens).
   * @param {PlaywrightWaitState} [waitState=PlaywrightWaitState.VISIBLE] - The pre-action sync state required by this element.
   * @param {ElementTimeout} [timeout=ElementTimeout.LONG] - Maximum wait threshold before throwing an explicit error.
   */
  constructor(
    selector: string,
    waitState: PlaywrightWaitState = PlaywrightWaitState.VISIBLE,
    timeout: ElementTimeout = ElementTimeout.LONG
  ) {
    this._selector = selector;
    this._waitState = waitState;
    this._timeout = timeout;
  }

  public get selector(): string {
    return this._selector;
  }

  public get waitState(): PlaywrightWaitState {
    return this._waitState;
  }

  public get timeout(): ElementTimeout {
    return this._timeout;
  }

  /**
   * Resolves multiple '?' placeholders sequentially from left to right and returns a brand new UIElement instance.
   * Maintains strict state immutability to prevent cross-thread contamination in parallel runs.
   * * @example
   * // Multiple placeholders template
   * const rowCell = new UIElement("//table[@id='?']//tr[@data-id='?']", PlaywrightWaitState.ATTACHED, ElementTimeout.SHORT);
   * const concreteCell = UIElement.resolveDynamic(rowCell, "usersTable", 105);
   * // Resulting selector: "//table[@id='usersTable']//tr[@data-id='105']"
   * * @param {UIElement} targetElement - The base UIElement configuration acting as the template.
   * @param {(string | number)[]} args - Variadic arguments to replace each '?' occurrence in exact sequence.
   * @returns {UIElement} A new isolated instance of UIElement with fully compiled parameters.
   */
  public static resolveDynamic(targetElement: UIElement, ...args: (string | number)[]): UIElement {
    let compiledSelector = targetElement.selector;
    
    // Iterate through every argument and replace the first occurrence of '?' sequentially
    for (const arg of args) {
      compiledSelector = compiledSelector.replace(/\?/, String(arg));
    }

    // Preserve the original waitState and timeout configuration in the new DTO
    return new UIElement(
      compiledSelector,
      targetElement.waitState,
      targetElement.timeout
    );
  }
}