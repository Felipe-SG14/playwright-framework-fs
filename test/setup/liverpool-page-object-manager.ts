import { PageObjectManager } from '@playwright-framework/fs'
import { LiverpoolHomePage } from '../pages/index.js';

export class LiverpoolPageObjectManager extends PageObjectManager {
    private _liverpoolHomePage?: LiverpoolHomePage;

    get liverpoolHomePage() {
        return this._liverpoolHomePage ??= new LiverpoolHomePage(this.actions);
    }
}