import { FullConfig } from '@playwright/test';
import * as path from 'path';
import { pathToFileURL } from 'url';

/**
 * Orchestrated Global Teardown Hook.
 * Executes Core framework teardown followed by consumer-defined teardowns sequentially.
 */
async function orchestratedTeardown(config: FullConfig): Promise<void> {
  // A. CORE FRAMEWORK TEARDOWN
  try {
    console.log('[CORE SUCCESS] Global Teardown completed: Core automation processes finished cleanly.');
  } catch (error) {
    console.error(`[CORE ERROR] Critical failure during Core Global Teardown execution: ${error}`);
  }

  // B. CONSUMER EXTENSION DOWNSTREAM
  if (process.env.CORE_CONSUMER_TEARDOWN_PATH) {
    try {
      // Convert absolute path to a valid file:// URL string to satisfy ESM dynamic import mandates
      const fileUrl = pathToFileURL(path.resolve(process.env.CORE_CONSUMER_TEARDOWN_PATH)).href;
      const consumerModule = await import(fileUrl);
      
      // Handle both default exports and direct functions
      const consumerTeardown = consumerModule.default || consumerModule;
      await consumerTeardown(config);
      
      console.log('[CONSUMER SUCCESS] User-defined custom Global Teardown completed execution.');
    } catch (error) {
      console.error(`[CONSUMER ERROR] User-defined custom Global Teardown failed: ${error}`);
    }
  }
}

export default orchestratedTeardown;