import { FullConfig } from '@playwright/test';

async function myCustomSetup(config: FullConfig) {
  console.log('[CONSUMER LOG] Hello from Custom User Setup! Connecting to test database...');
}

export default myCustomSetup;