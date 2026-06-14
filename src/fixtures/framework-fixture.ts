import { test as baseTest } from '@playwright/test';
import { PageObjectManager } from '../pages/page-object-manager.js';
import { Constructor, FrameworkFixtures } from '../types/fixtures.types.js'; 

/**
 * Centralized test factory. Injects and instantiates the project's specific 
 * PageObjectManager into the Playwright lifecycle automatically.
 * * @param {Constructor<T>} ConcreteManager - The uninstantiated class pointer of the project's manager.
 * @returns An extended Playwright test runner pre-loaded with the custom generic fixture.
 */
export function createFrameworkTest<T extends PageObjectManager>(ConcreteManager: Constructor<T>) {
  return baseTest.extend<FrameworkFixtures<T>>({
    pom: async ({ page }, use) => {
      // The Core safely instantiates the project's custom manager on-the-fly per thread
      const pomInstance = new ConcreteManager(page);
      
      // Yields the fully typed instance directly to the spec file
      await use(pomInstance);
    },
  });
}