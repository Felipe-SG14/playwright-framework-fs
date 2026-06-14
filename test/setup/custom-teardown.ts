import { FullConfig } from '@playwright/test';

async function myCustomTeardown(config: FullConfig) {
  console.log('[CONSUMER LOG] Hello from Custom User Teardown! Closing database pools...');
}

export default myCustomTeardown;