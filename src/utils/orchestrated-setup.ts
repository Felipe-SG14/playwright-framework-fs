import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url'; // Native Node utility to safely format paths for dynamic imports

/**
 * Orchestrated Global Setup Hook.
 * Executes Core framework foundations followed by consumer-defined setups sequentially.
 */
async function orchestratedSetup(config: FullConfig): Promise<void> {
  const reportsDir = path.join(process.cwd(), 'reports');

  // A. CORE FRAMEWORK CLEANUP
  try {
    if (fs.existsSync(reportsDir)) {
      fs.rmSync(reportsDir, { recursive: true, force: true });
    }
    console.log('[CORE SUCCESS] Global Setup completed: Legacy reports directory has been successfully purged.');
  } catch (error) {
    console.error(`[CORE ERROR] Failed to clean reports directory during Global Setup: ${error}`);
    throw error;
  }

  // B. CONSUMER EXTENSION DOWNSTREAM
  if (process.env.CORE_CONSUMER_SETUP_PATH) {
    try {
      // Convert absolute path to a valid file:// URL string to satisfy ESM dynamic import mandates
      const fileUrl = pathToFileURL(path.resolve(process.env.CORE_CONSUMER_SETUP_PATH)).href;
      const consumerModule = await import(fileUrl);
      
      // Handle both default exports and direct functions
      const consumerSetup = consumerModule.default || consumerModule;
      await consumerSetup(config);
      
      console.log('[CONSUMER SUCCESS] User-defined custom Global Setup completed execution.');
    } catch (error) {
      console.error(`[CONSUMER ERROR] User-defined custom Global Setup failed: ${error}`);
      throw error;
    }
  }
}

export default orchestratedSetup;