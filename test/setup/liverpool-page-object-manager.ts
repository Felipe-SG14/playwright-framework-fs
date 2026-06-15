import { PageObjectManager } from '@playwright-framework/fs'
import { LiverpoolHomePage, LiverpoolSearchResultsPage } from '../pages/index.js';

export class LiverpoolPageObjectManager extends PageObjectManager {
    private _liverpoolHomePage?: LiverpoolHomePage;
    private _liverpoolSearchResultsPage?: LiverpoolSearchResultsPage

    get liverpoolHomePage() {
        return this._liverpoolHomePage ??= new LiverpoolHomePage(this.actions);
    }

    get liverpoolSearchResultsPage() {
        return this._liverpoolSearchResultsPage ??= new LiverpoolSearchResultsPage(this.actions);
    }
}