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

    // 🌟 BRIDGE CUSTOM HOOKS TO PROCESS ENV TO PASS AS STRINGS Safely
    if (customOverrides.globalSetup && typeof customOverrides.globalSetup === 'string') {
      process.env.CORE_CONSUMER_SETUP_PATH = path.resolve(customOverrides.globalSetup);
    }
    if (customOverrides.globalTeardown && typeof customOverrides.globalTeardown === 'string') {
      process.env.CORE_CONSUMER_TEARDOWN_PATH = path.resolve(customOverrides.globalTeardown);
    }

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
      globalSetup: path.resolve(process.cwd(), 'src', 'utils', 'orchestrated-setup.ts'),
      globalTeardown: path.resolve(process.cwd(), 'src', 'utils', 'orchestrated-teardown.ts'),
      testDir: path.resolve(rootDir, 'test', 'specs'),
      testMatch: '**/*.spec.ts',
      fullyParallel: true,
      retries: process.env.RETRIES ? parseInt(process.env.RETRIES, 10) : 0,
      workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : 1,

      // ABSOLUTE PATH DISTRIBUTION FOR TEST REPORTING PIPELINES
      reporter: [
        ['list'],
        ['html', { outputFolder: path.join(reportsDir, 'playwright-report'), open: 'never' }],
        ['junit', { outputFile: path.join(reportsDir, 'junit', 'junit-report.xml'), stripANSIControlSequences: true, embedAnnotationsAsProperties: true, includeProjectInTestName: true }],
        ['allure-playwright', { detail: true, resultsDir: path.join(reportsDir, 'allure-results'), suiteTitle: true, forceClean: true }]
      ],

      // CENTRALIZED GLOBAL EXECUTION ENVIRONMENT
      use: {
        headless: true,
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
            launchOptions: { args: ['--no-remote'] }
          },
        },
        {
          name: 'webkit',
          use: { 
            ...devices['Desktop Safari'],
            launchOptions: { args: [] } 
          },
        },
      ],
    };

    // Clean out the consumer properties if they were provided to prevent them from wiping out our drivers during deep merge
    const sanitizedOverrides = { ...customOverrides };
    delete sanitizedOverrides.globalSetup;
    delete sanitizedOverrides.globalTeardown;

    return {
      ...baseConfig,
      ...sanitizedOverrides,
      use: {
        ...baseConfig.use,
        ...sanitizedOverrides.use,
        launchOptions: {
          ...baseConfig.use?.launchOptions,
          ...sanitizedOverrides.use?.launchOptions,
        }
      }
    };
  }
}