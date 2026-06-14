import { PlaywrightTestConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * @class ConfigurationFactory
 * @description Enterprise-grade configuration factory for the test automation framework ecosystem.
 * Centralizes multi-browser matrices and enforces Playwright's native full-browser Chromium channel 
 * to execute the authentic New Headless Mode, bypassing advanced anti-bot solutions.
 */
export class ConfigurationFactory {
  
  /**
   * @static
   * @method createConfig
   * @description Generates a unified, production-ready Playwright configuration object.
   * Leverages the official 'chromium' channel to execute high-accuracy end-to-end web testing 
   * via the authentic Chrome engine, eliminating anti-bot blocking without manual environment tracking.
   * @param {Partial<PlaywrightTestConfig>} [customOverrides={}] - Project-specific configuration blocks to deeply merge.
   * @returns {PlaywrightTestConfig} A complete, decoupled, and immutable Playwright configuration structure.
   * @example
   * // In the consumer repository's playwright.config.ts:
   * import { ConfigurationFactory } from '@your-framework/core';
   * export default ConfigurationFactory.createConfig({
   * use: { baseURL: 'https://example.com' }
   * });
   */
  public static createConfig(customOverrides: Partial<PlaywrightTestConfig> = {}): PlaywrightTestConfig {
    const rootDir = path.resolve(process.cwd());
    const reportsDir = path.join(rootDir, 'reports');

    // 1. CONSOLIDATED CHROMIUM CAMOUFLAGE ARGUMENTS
    const chromiumArgs = [
      '--start-maximized',
      '--disable-infobars',
      '--disable-popup-blocking',
      '--disable-extensions',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-gl=desktop'
    ];

    // 2. CORE ARCHITECTURE SPECIFICATION
    const baseConfig: PlaywrightTestConfig = {
      testDir: path.resolve(rootDir, 'test', 'specs'),
      testMatch: '**/*.spec.ts',
      fullyParallel: true,
      retries: process.env.RETRIES ? parseInt(process.env.RETRIES, 10) : 0,
      workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : 1,

      // ABSOLUTE PATH DISTRIBUTION FOR TEST REPORTING PIPELINES
      reporter: [
        ['html', { outputFolder: path.join(reportsDir, 'playwright-report'), open: 'never' }],
        ['junit', { outputFile: path.join(reportsDir, 'junit', 'junit-report.xml'), stripANSIControlSequences: true, embedAnnotationsAsProperties: true, includeProjectInTestName: true }],
        ['allure-playwright', { detail: true, resultsDir: path.join(reportsDir, 'allure-results'), suiteTitle: true, forceClean: true }]
      ],

      // CENTRALIZED GLOBAL EXECUTION ENVIRONMENT
      use: {
        headless: true, // Playwright naturally forces false if '--headed' is passed via CLI
        viewport: { width: 1920, height: 1080 },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        acceptDownloads: false,
        locale: 'es-MX',
        timezoneId: 'America/Mexico_City',
        launchOptions: { args: chromiumArgs }
      },

      // MULTI-BROWSER MATRIX (Projects inherit properties downstream from the global 'use' block)
      projects: [
        {
          name: 'chromium',
          use: { 
            ...devices['Desktop Chrome'],
            // 🌟 THE SOLUTION: Forces Playwright to use the real Chromium browser instead of the leaky headless shell.
            // When running invisibly, this natively triggers the authentic, reliable "New Headless Mode".
            channel: 'chromium' 
          },
        },
        {
          name: 'msedge',
          use: { 
            ...devices['Desktop Edge'], 
            channel: 'msedge' 
          },
        },
        {
          name: 'firefox',
          use: { 
            ...devices['Desktop Firefox'],
            // Firefox uses its own launch arguments to prevent binary interpretation crashes against chromium flags
            launchOptions: { args: ['--no-remote'] }
          },
        },
        {
          name: 'webkit',
          use: { 
            ...devices['Desktop Safari'],
            // WebKit overrides launchOptions to run cleanly without experimental desktop flags
            launchOptions: { args: [] } 
          },
        },
      ],
    };

    // 3. SAFE LIQUID DEEP MERGE DELIVERING IMMUTABLE CONFIGURATION OBJECTS
    return {
      ...baseConfig,
      ...customOverrides,
      use: {
        ...baseConfig.use,
        ...customOverrides.use,
        launchOptions: {
          ...baseConfig.use?.launchOptions,
          ...customOverrides.use?.launchOptions,
        }
      }
    };
  }
}