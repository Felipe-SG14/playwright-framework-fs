import { Page } from "@playwright/test";
import { PageObjectManager } from "../pages/page-object-manager.js";


/**
 * Represents a constructable type (a class with a new constructor) 
 * that extends the abstract core PageObjectManager.
 */
export type Constructor<T extends PageObjectManager> = new (page: Page) => T;

/**
 * Custom framework fixture structure where 'pom' dynamically morphs 
 * into the concrete project's manager type.
 */
export type FrameworkFixtures<T extends PageObjectManager> = {
  pom: T;
};