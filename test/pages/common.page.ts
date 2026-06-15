import { BasePage, ElementTimeout, PlaywrightWaitState, UIElement } from '@playwright-framework/fs'
import { CommonPageLocators } from '../locators/common-page.locators'

export class CommonPage extends BasePage {

    public get liverpoolImage() {
        return new UIElement(CommonPageLocators.liverpoolImage, PlaywrightWaitState.VISIBLE, ElementTimeout.LONG)
    }

    async navigateToHomePage() : Promise<void> {
        await this.actions.navigateTo("https://www.liverpool.com.mx/");
        await this.actions.waitForVisibility(this.liverpoolImage);
    }
}