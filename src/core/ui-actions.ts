import { Page, Locator, test, Response } from '@playwright/test';
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
   * @param {UIElement} element - The target UIElement DTO containing the selector string and sync configurations.
   * @returns {Promise<Locator>} A Promise that resolves to the native Playwright Locator ready for interaction.
   * @private
   */
  private async waitFor(element: UIElement): Promise<Locator> {
    try {
      const locator = this.page.locator(element.selector);
      await locator.waitFor({
        state: element.waitState,
        timeout: element.timeout
      });
      return locator;
    } catch (error) {
      console.error(`[CORE ERROR] Element synchronization failed for selector "${element.selector}" targeting state "${element.waitState}": ${error}`);
      throw error;
    }
  }

  /**
   * Waits dynamically for a collection of elements to stabilize in the DOM.
   * Sealed internally to protect the framework's synchronization pipeline.
   * @private
   * @async
   * @method waitForCollection
   * @param {UIElement} element - The target UIElement DTO containing the selector and custom configurations.
   * @returns {Promise<Locator>} A Promise that resolves when the first element of the collection is visible.
   */
  private async waitForCollection(element: UIElement): Promise<Locator> {
    try {
      const locator = this.page.locator(element.selector);
      await locator.first().waitFor({
        state: element.waitState,
        timeout: element.timeout
      });
      return locator;
    } catch (error) {
      console.error(`[CORE ERROR] Collection synchronization failed for selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Navigates the active browser context directly to the specified URL.
   * Automatically waits until the page fires the 'load' event before completing.
   * Wrapped inside an isolated reporting test step for pipeline visibility.
   * @param {string} url - The target web address or application route.
   * @returns {Promise<void>} A Promise that resolves when the page has successfully loaded the target URL.
   * @public
   */
  public async navigateTo(url: string): Promise<void> {
    try {
      await test.step(`[UIActions] Navigate to: "${url}"`, async () => {
        await this.page.goto(url, {
          waitUntil: 'load'
        });
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Failed navigation workflow targeting route "${url}": ${error}`);
      throw error;
    }
  }

  /**
   * Explicitly waits until the active browser context URL transitions and matches the specified pattern or string.
   * Useful for validating state transitions (e.g., successful logins or checkout redirects).
   * @async
   * @method waitForUrlChanges
   * @param {string | RegExp | ((url: URL) => boolean)} expectedUrl - The target URL path, regex pattern, or predicate function.
   * @param {number} [timeout=10000] - Maximum time to wait for the URL transition in milliseconds.
   * @returns {Promise<void>} A Promise that resolves when the browser URL successfully matches the expected criteria.
   * @public
   */
  public async waitForUrlChanges(
    expectedUrl: string | RegExp | ((url: URL) => boolean), 
    timeout: number = 10000
  ): Promise<void> {
    try {
      // 1. We wrap the navigation sync state within an isolated Playwright reporting step
      await test.step(`[UIActions] Wait for URL change matching: "${expectedUrl.toString()}"`, async () => {
        // 2. Leverages Playwright's native frame-aware URL synchronization mechanism
        await this.page.waitForURL(expectedUrl, { timeout });
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Timeout exceeded waiting for browser URL to transition to "${expectedUrl.toString()}": ${error}`);
      throw error;
    }
  }

  /**
   * Forces the execution thread to pause for a fixed, hardcoded duration.
   * @param {number} milliseconds - The exact duration to halt the test execution.
   * @returns {Promise<void>} A Promise that resolves when the specified time sleep concludes.
   * @public
   */
  public async pause(milliseconds: number): Promise<void> {
    const seconds = (milliseconds / 1000).toFixed(1);
    try {
      await test.step(`[UIActions] ⚠️ Hard Pause: Halting execution for ${seconds}s`, async () => {
        await this.page.waitForTimeout(milliseconds);
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Interruption encountered during hard pause operational thread: ${error}`);
      throw error;
    }
  }

  /**
   * Explicitly waits until an element matches the `visible` state on the viewport.
   * @param {UIElement} element - The target UIElement DTO containing the selector and custom timeout threshold.
   * @returns {Promise<void>} A Promise that resolves when the element becomes visible.
   * @public
   */
  public async waitForVisibility(element: UIElement): Promise<void> {
    try {
      await test.step(`[UIActions] Wait for visibility of: "${element.selector}"`, async () => {
        const locator = this.page.locator(element.selector);
        await locator.waitFor({ state: PlaywrightWaitState.VISIBLE, timeout: element.timeout });
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Timeout exceeded waiting for explicit visibility threshold on selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Explicitly waits until an element matches the `hidden` state.
   * @param {UIElement} element - The target UIElement DTO containing the selector and custom timeout threshold.
   * @returns {Promise<void>} A Promise that resolves when the element is hidden.
   * @public
   */
  public async waitForHidden(element: UIElement): Promise<void> {
    try {
      await test.step(`[UIActions] Wait for hidden state of: "${element.selector}"`, async () => {
        const locator = this.page.locator(element.selector);
        await locator.waitFor({ state: PlaywrightWaitState.HIDDEN, timeout: element.timeout });
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Timeout exceeded waiting for explicit hidden threshold on selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Explicitly waits until an element matches the `attached` state in the DOM structure.
   * @param {UIElement} element - The target UIElement DTO containing the selector and custom timeout threshold.
   * @returns {Promise<void>} A Promise that resolves when the element attaches to the DOM.
   * @public
   */
  public async waitForAttachment(element: UIElement): Promise<void> {
    try {
      await test.step(`[UIActions] Wait for DOM attachment of: "${element.selector}"`, async () => {
        const locator = this.page.locator(element.selector);
        await locator.waitFor({ state: PlaywrightWaitState.ATTACHED, timeout: element.timeout });
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Timeout exceeded waiting for explicit DOM attachment on selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Explicitly waits until an element matches the `detached` state.
   * @param {UIElement} element - The target UIElement DTO containing the selector and custom timeout threshold.
   * @returns {Promise<void>} A Promise that resolves when the element detaches from the DOM.
   * @public
   */
  public async waitForDetachment(element: UIElement): Promise<void> {
    try {
      await test.step(`[UIActions] Wait for DOM detachment of: "${element.selector}"`, async () => {
        const locator = this.page.locator(element.selector);
        await locator.waitFor({ state: PlaywrightWaitState.DETACHED, timeout: element.timeout });
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Timeout exceeded waiting for explicit DOM detachment on selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Captures a screenshot, converts it to a Base64 string, and attaches it to the report.
   * @param {string} attachmentName - Description name for the screenshot in the report.
   * @returns {Promise<void>} A Promise that resolves when the screenshot has been successfully embedded.
   * @public
   */
  public async takeScreenshot(attachmentName: string): Promise<void> {
    try {
      await test.step(`[UIActions] Capture screenshot: "${attachmentName}"`, async () => {
        const screenshotBuffer = await this.page.screenshot({ fullPage: false });
        const base64Screenshot = screenshotBuffer.toString('base64');
        await test.info().attach(attachmentName, {
          body: Buffer.from(base64Screenshot, 'base64'),
          contentType: 'image/png'
        });
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Failed to extract or attach operational screenshot metadata "${attachmentName}": ${error}`);
      throw error;
    }
  }

  /**
   * Explicitly scrolls the viewport until the target UIElement becomes visible.
   * @param {UIElement} element - The target UIElement DTO containing the selector string and sync configurations.
   * @returns {Promise<void>} A Promise that resolves when the scrolling animation conclude.
   * @public
   */
  public async scrollToElement(element: UIElement): Promise<void> {
    try {
      await test.step(`[UIActions] Scroll into view for: "${element.selector}"`, async () => {
        const locator = await this.waitFor(element);
        await locator.scrollIntoViewIfNeeded({ timeout: element.timeout });
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Failed operational view scroll action targeting selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Resolves the element through its native synchronization strategy and triggers a mouse click.
   * @param {UIElement} element - The target UIElement DTO to be clicked.
   * @returns {Promise<void>} A Promise that resolves when the click action completes.
   * @public
   */
  public async click(element: UIElement): Promise<void> {
    try {
      await test.step(`[UIActions] Click on: "${element.selector}"`, async () => {
        const locator = await this.waitFor(element);
        await locator.click();
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Mouse click interaction failed on selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Resolves the element, clears any existing text input entirely, and inputs the specified text value.
   * @param {UIElement} element - The target text field UIElement DTO.
   * @param {string} text - The raw string value to input into the field.
   * @returns {Promise<void>} A Promise that resolves when the typing action concludes.
   * @public
   */
  public async fill(element: UIElement, text: string): Promise<void> {
    const isSensitive = element.selector.toLowerCase().includes('password') || 
                        element.selector.toLowerCase().includes('pass');
    const logText = isSensitive ? '********' : text;

    try {
      await test.step(`[UIActions] Fill "${logText}" into: "${element.selector}"`, async () => {
        const locator = await this.waitFor(element);
        await locator.fill('');
        await locator.fill(text);
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Text entry interaction failed on selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Focuses the target UIElement and simulates a single key press or modifier combination.
   * @param {UIElement} element - The target UIElement DTO to receive the keypress event.
   * @param {string} key - The key name or combination string supported by Playwright.
   * @returns {Promise<void>} A Promise that resolves when the keypress event has been successfully dispatched.
   * @public
   */
  public async pressKey(element: UIElement, key: string): Promise<void> {
    try {
      await test.step(`[UIActions] Press key "${key}" on: "${element.selector}"`, async () => {
        const locator = await this.waitFor(element);
        await locator.press(key);
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Keyboard dispatch interaction failed for key "${key}" on selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Resolves the element and retrieves its native inner text value, clearing trailing and leading spaces.
   * @param {UIElement} element - The target UIElement DTO from which to extract text.
   * @returns {Promise<string>} A Promise that resolves to the trimmed string content of the component.
   * @public
   */
  public async getText(element: UIElement): Promise<string> {
    try {
      return await test.step(`[UIActions] Get text from: "${element.selector}"`, async () => {
        const locator = await this.waitFor(element);
        const text = await locator.innerText();
        return text.trim();
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Extraction of inner text failed on selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Extracts the inner text from all matching elements within a UIElement collection.
   * Wrapped inside an isolated reporting test step for pipeline visibility.
   * @async
   * @method getTextFromAll
   * @param {UIElement} element - The framework's UIElement wrapper representing the collection.
   * @returns {Promise<string[]>} An array containing the clean, trimmed text strings of all elements.
   */
  public async getTextFromAll(element: UIElement): Promise<string[]> {
    try {
      return await test.step(`[UIActions] Get text from all: "${element.selector}"`, async () => {
        const locator = await this.waitForCollection(element);
        const texts = await locator.allTextContents();
        return texts.map(text => text.trim());
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Failed to extract text contents from the collection matching selector "${element.selector}": ${error}`);
      throw error;
    }
  }

  /**
   * Explicitly captures a specific API network response and extracts its JSON payload.
   * @async
   * @method getResponseJson
   * @param {string | RegExp | ((response: Response) => boolean | Promise<boolean>)} urlPattern - The target API route.
   * @param {number} [timeout=15000] - Maximum wait time in milliseconds.
   * @returns {Promise<any>} A Promise that resolves to the parsed JSON body.
   * @public
   */
  public async getResponseJson(
    // 2. Al haber importado Response arriba, TypeScript ya sabrá que nos referimos al tipo de Playwright
    urlPattern: string | RegExp | ((response: Response) => boolean | Promise<boolean>),
    timeout: number = 15000
  ): Promise<any> {
    try {
      return await test.step(`[UIActions] Capture JSON response from: "${urlPattern.toString()}"`, async () => {
        const response = await this.page.waitForResponse(urlPattern, { timeout });
        return await response.json();
      });
    } catch (error) {
      console.error(`[ACTION ERROR] Failed to capture or parse JSON from network route "${urlPattern.toString()}": ${error}`);
      throw error;
    }
  }

  /**
   * Extracts the state hydration JSON injected by Next.js inside Liverpool's HTML body.
   * @async
   * @method getNextJsHydrationData
   * @returns {Promise<Record<string, any>>} The parsed backend data structure representing the catalog.
   * @public
   */
  public async getNextJsHydrationData(): Promise<Record<string, any>> {
    return await test.step('[Page Object] Extracting Next.js state data', async () => {
      const nextDataScript = this.page.locator('script#__NEXT_DATA__');
      const rawJson = await nextDataScript.evaluate((el) => el.textContent);
      if (!rawJson) {
        throw new Error('[DATA ERROR] Next.js hydration script block "__NEXT_DATA__" was empty or not found.');
      }
      const fullPayload = JSON.parse(rawJson);
      return fullPayload;
    });
  }
}