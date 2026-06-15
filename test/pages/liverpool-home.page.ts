import { LiverpoolHomePageLocators } from '../locators/liverpool-home-page.locators';
import { CommonPage } from './common.page';
import { UIElement } from '@playwright-framework/fs'

export class LiverpoolHomePage extends CommonPage {

    protected get searchInput() {
        return new UIElement(LiverpoolHomePageLocators.searchInput)
    }

    async searchProduct(product: string) : Promise<void> {
        await this.actions.fill(this.searchInput, product);
        await this.actions.takeScreenshot("Product Added to Search Input")
        await this.actions.pressKey(this.searchInput, 'Enter');
    }

}