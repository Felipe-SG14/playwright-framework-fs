import { Page, Locator, test } from '@playwright/test';
import { UIElement } from './ui-element.js';
import { PlaywrightWaitState } from '../types/index.js';

/**
 * Execution engine instance responsible for interacting with UI components.
 * Bound to a specific Playwright Page context to ensure clean parallel execution,
 * thread isolation, and automated technical step reporting using native selectors.
 */
export class UIActions {
  /**
   * The active Playwright Page instance dedicated to this execution thread.
   * @private
   */
  private readonly page: Page;

  /**
   * Initializes the action engine with a dedicated browser context page.
   * @param {Page} page - The active Playwright Page instance for the current test thread.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Internal core synchronization method that resolves the UIElement DTO into a native Playwright Locator
   * and triggers the configured state and timeout thresholds.
   * * @param {UIElement} element - The target UIElement DTO containing the selector string and sync configurations.
   * @returns {Promise<Locator>} A Promise that resolves to the native Playwright Locator ready for interaction.
   * @private
   */
  private async waitFor(element: UIElement): Promise<Locator> {
    const locator = this.page.locator(element.selector);
    await locator.waitFor({
      state: element.waitState,
      timeout: element.timeout
    });
    return locator;
  }

  /**
   * Navigates the active browser context directly to the specified URL.
   * Automatically waits until the page fires the 'load' event before completing.
   * Wrapped inside an isolated reporting test step for pipeline visibility.
   * * @param {string} url - The target web address or application route (e.g., 'https://saucedemo.com/dashboard').
   * @returns {Promise<void>} A Promise that resolves when the page has successfully loaded the target URL.
   * @public
   */
  public async navigateTo(url: string): Promise<void> {
    await test.step(`[UIActions] Navigate to: "${url}"`, async () => {
      // Triggers the native navigation and waits for the standard 'load' lifecycle event
      await this.page.goto(url, {
        waitUntil: 'load'
      });
    });
  }

  /**
   * Forces the execution thread to pause for a fixed, hardcoded duration.
   * Warning: Use this method sparingly as a last resort. Dynamic waits (e.g., waitForVisibility) 
   * are always preferred over hardcoded pauses to maintain fast, stable test suites.
   * * @param {number} milliseconds - The exact duration to halt the test execution (e.g., 3000 for 3 seconds).
   * @returns {Promise<void>} A Promise that resolves when the specified time sleep concludes.
   * @public
   */
  public async pause(milliseconds: number): Promise<void> {
    const seconds = (milliseconds / 1000).toFixed(1);
    await test.step(`[UIActions] ⚠️ Hard Pause: Halting execution for ${seconds}s`, async () => {
      // Utiliza el mecanismo de retraso nativo de Playwright amarrado al hilo de esta página
      await this.page.waitForTimeout(milliseconds);
    });
  }

  /**
   * Explicitly waits until an element matches the `visible` state on the viewport.
   * Overrides the default element state configuration to force visibility sync.
   * * @param {UIElement} element - The target UIElement DTO containing the selector and custom timeout threshold.
   * @returns {Promise<void>} A Promise that resolves when the element becomes visible.
   * @public
   */
  public async waitForVisibility(element: UIElement): Promise<void> {
    await test.step(`[UIActions] Wait for visibility of: "${element.selector}"`, async () => {
      const locator = this.page.locator(element.selector);
      await locator.waitFor({ state: PlaywrightWaitState.VISIBLE, timeout: element.timeout });
    });
  }

  /**
   * Explicitly waits until an element matches the `hidden` state (either detached from DOM or CSS hidden).
   * Overrides the default element state configuration to force hidden sync.
   * * @param {UIElement} element - The target UIElement DTO containing the selector and custom timeout threshold.
   * @returns {Promise<void>} A Promise that resolves when the element is hidden.
   * @public
   */
  public async waitForHidden(element: UIElement): Promise<void> {
    await test.step(`[UIActions] Wait for hidden state of: "${element.selector}"`, async () => {
      const locator = this.page.locator(element.selector);
      await locator.waitFor({ state: PlaywrightWaitState.HIDDEN, timeout: element.timeout });
    });
  }

  /**
   * Explicitly waits until an element matches the `attached` state in the DOM structure.
   * Note: The element might be present in the DOM but still visually hidden.
   * * @param {UIElement} element - The target UIElement DTO containing the selector and custom timeout threshold.
   * @returns {Promise<void>} A Promise that resolves when the element attaches to the DOM.
   * @public
   */
  public async waitForAttachment(element: UIElement): Promise<void> {
    await test.step(`[UIActions] Wait for DOM attachment of: "${element.selector}"`, async () => {
      const locator = this.page.locator(element.selector);
      await locator.waitFor({ state: PlaywrightWaitState.ATTACHED, timeout: element.timeout });
    });
  }

  /**
   * Explicitly waits until an element matches the `detached` state, meaning it is completely removed from the DOM.
   * * @param {UIElement} element - The target UIElement DTO containing the selector and custom timeout threshold.
   * @returns {Promise<void>} A Promise that resolves when the element detaches from the DOM.
   * @public
   */
  public async waitForDetachment(element: UIElement): Promise<void> {
    await test.step(`[UIActions] Wait for DOM detachment of: "${element.selector}"`, async () => {
      const locator = this.page.locator(element.selector);
      await locator.waitFor({ state: PlaywrightWaitState.DETACHED, timeout: element.timeout });
    });
  }

  /**
   * Captures a full-page or viewport screenshot, converts it to a Base64 string, 
   * and attaches it directly to the active Playwright/Allure test report as visual evidence.
   * This prevents creating physical files on the local disk or CI pipeline agents.
   * * @param {string} attachmentName - Description name for the screenshot in the report (e.g., 'Success Dashboard').
   * @returns {Promise<void>} A Promise that resolves when the screenshot has been successfully embedded into the report.
   * @public
   */
  public async takeScreenshot(attachmentName: string): Promise<void> {
    await test.step(`[UIActions] Capture screenshot: "${attachmentName}"`, async () => {
      // 1. Capture the screenshot natively as a binary Buffer
      const screenshotBuffer = await this.page.screenshot({
        fullPage: false // Change to true if you want the entire scrollable page
      });

      // 2. Convert the Buffer into a safe, lightweight Base64 string
      const base64Screenshot = screenshotBuffer.toString('base64');

      // 3. Attach the Base64 image directly into the active test execution metadata
      await test.info().attach(attachmentName, {
        body: Buffer.from(base64Screenshot, 'base64'),
        contentType: 'image/png'
      });
    });
  }

  /**
   * Explicitly scrolls the viewport until the target UIElement becomes visible.
   * If the element is already fully visible inside the viewport, no scrolling action is performed.
   * Automatically wrapped inside an isolated reporting test step using the native element selector.
   * * @param {UIElement} element - The target UIElement DTO containing the selector string and sync configurations.
   * @returns {Promise<void>} A Promise that resolves when the scrolling animation and synchronization conclude.
   * @public
   */
  public async scrollToElement(element: UIElement): Promise<void> {
    await test.step(`[UIActions] Scroll into view for: "${element.selector}"`, async () => {
      // 1. We resolve the component through our internal thread-safe synchronization strategy
      const locator = await this.waitFor(element);
      
      // 2. Triggers the native non-blocking scroll action
      await locator.scrollIntoViewIfNeeded({
        timeout: element.timeout
      });
    });
  }

  /**
   * Resolves the element through its native synchronization strategy and triggers a mouse click.
   * Automatically wrapped inside a native reporting test step displaying the raw selector.
   * * @param {UIElement} element - The target UIElement DTO to be clicked.
   * @returns {Promise<void>} A Promise that resolves when the click action completes.
   * @public
   */
  public async click(element: UIElement): Promise<void> {
    await test.step(`[UIActions] Click on: "${element.selector}"`, async () => {
      const locator = await this.waitFor(element);
      await locator.click();
    });
  }

  /**
   * Resolves the element, clears any existing text input entirely, and inputs the specified text value.
   * Automatically detects sensitive selector patterns (e.g., 'pass', 'password') to mask credentials in the report.
   * * @param {UIElement} element - The target text field UIElement DTO.
   * @param {string} text - The raw string value to input into the field.
   * @returns {Promise<void>} A Promise that resolves when the typing action concludes.
   * @public
   */
  public async fill(element: UIElement, text: string): Promise<void> {
    const isSensitive = element.selector.toLowerCase().includes('password') || 
                        element.selector.toLowerCase().includes('pass');
    const logText = isSensitive ? '********' : text;

    await test.step(`[UIActions] Fill "${logText}" into: "${element.selector}"`, async () => {
      const locator = await this.waitFor(element);
      await locator.fill('');
      await locator.fill(text);
    });
  }

  /**
   * Focuses the target UIElement and simulates a single key press or modifier combination 
   * (e.g., 'Enter', 'Tab', 'Control+A', 'ArrowDown').
   * Automatically wrapped inside a native reporting test step displaying the key and selector.
   * * @param {UIElement} element - The target UIElement DTO to receive the keypress event.
   * @param {string} key - The key name or combination string supported by Playwright (e.g., 'Enter', 'Control+V').
   * @returns {Promise<void>} A Promise that resolves when the keypress event has been successfully dispatched.
   * @public
   */
  public async pressKey(element: UIElement, key: string): Promise<void> {
    await test.step(`[UIActions] Press key "${key}" on: "${element.selector}"`, async () => {
      // 1. Synchronize the element using the thread-safe core wait strategy
      const locator = await this.waitFor(element);
      
      // 2. Dispatches the keyboard event natively
      await locator.press(key);
    });
  }

  /**
   * Resolves the element and retrieves its native inner text value, clearing trailing and leading spaces.
   * * @param {UIElement} element - The target UIElement DTO from which to extract text.
   * @returns {Promise<string>} A Promise that resolves to the trimmed string content of the component.
   * @public
   */
  public async getText(element: UIElement): Promise<string> {
    return await test.step(`[UIActions] Get text from: "${element.selector}"`, async () => {
      const locator = await this.waitFor(element);
      const text = await locator.innerText();
      return text.trim();
    });
  }
}