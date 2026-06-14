import { BasePage, UIElement } from '@playwright-framework/fs'
import { CommonPageLocators } from '../locators/common.locators'

export class CommonPage extends BasePage {

    public get liverpoolImage() {
        return new UIElement(CommonPageLocators.liverpoolImage)
    }

    async scrollToTop() : Promise<void> {
        //await this.actions
    }
}