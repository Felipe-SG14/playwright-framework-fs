import { LiverpoolSearchResultsPageLocators } from "../locators/liverpool-search-results-page.locators";
import { COLOR_FILTERS, ORDER_BY_OPTIONS } from "../setup/constants";
import { CommonPage } from "./common.page";
import { UIElement, ElementTimeout, PlaywrightWaitState } from '@playwright-framework/fs'

export class LiverpoolSearchResultsPage extends CommonPage {

    protected get productListContainer() {
        return new UIElement(LiverpoolSearchResultsPageLocators.productListContainer, PlaywrightWaitState.VISIBLE, ElementTimeout.X_LONG);
    }

    protected get colorButtonDynamic() {
        return new UIElement(LiverpoolSearchResultsPageLocators.colorButtonDynamic, PlaywrightWaitState.ATTACHED);
    }

    protected get colorFilterDiv() {
        return new UIElement(LiverpoolSearchResultsPageLocators.colorFilterDiv, PlaywrightWaitState.VISIBLE, ElementTimeout.LONG);
    }

    protected get sortByButton() {
        return new UIElement(LiverpoolSearchResultsPageLocators.sortByButton, PlaywrightWaitState.ATTACHED);
    }

    protected get sortByOptionDynamic() {
        return new UIElement(LiverpoolSearchResultsPageLocators.sortByOptionDynamic);
    }

    protected get productTitles() {
        return new UIElement(LiverpoolSearchResultsPageLocators.productTitles);
    }

    protected get productPrices() {
        return new UIElement(LiverpoolSearchResultsPageLocators.productPrices);
    }

    async waitForSearchResultPageToBeDisplayed() : Promise<void> {
        await this.actions.waitForVisibility(this.productListContainer);
        await this.actions.takeScreenshot("[LiverpoolSearchResultsPage] Search Results page is displayed");
    }

    async filterByColor(color: COLOR_FILTERS) : Promise<void> {
        const colorButton = UIElement.resolveDynamic(this.colorButtonDynamic, color);
        await this.actions.scrollToElement(colorButton);
        await this.actions.click(colorButton);
        await this.actions.scrollToElement(this.sortByButton);
        await this.actions.waitForVisibility(this.colorFilterDiv);
        await this.actions.takeScreenshot(`[LiverpoolSearchResultsPage] Color Filter: ${color} was selected`);
    }

    async orderProductsBy(orderCriteria: ORDER_BY_OPTIONS) : Promise<void> {
        await this.actions.waitForVisibility(this.sortByButton);
        await this.actions.click(this.sortByButton);
        const sortByOption = UIElement.resolveDynamic(this.sortByOptionDynamic, orderCriteria);
        await this.actions.click(sortByOption);
        const urlPart = orderCriteria.split('/').at(-1);
        const safeRegexString = urlPart?.replace('|', '\\|');
        await this.actions.waitForUrlChanges(new RegExp(safeRegexString ?? ''));
        await this.waitForSearchResultPageToBeDisplayed();
        await this.actions.takeScreenshot(`[LiverpoolSearchResultsPage] Order By Option: ${orderCriteria} was selected`);
    }

    /**
     * Retrieves the raw list of product records directly from the Next.js backend state.
     * @async
     * @method getProductsRecords
     * @returns {Promise<Array<Record<string, any>>>} A promise that resolves to the array of product records.
     */
    async getProductsRecords(): Promise<{ title: string; salePrice: number }[]> {
        const hydrationData = await this.actions.getNextJsHydrationData();
        const records: any[] = hydrationData.query?.data?.mainContent?.records ?? [];
        
        const cleanedProducts: { title: string; salePrice: number }[] = records.map((record) => {
            const title = record._t ?? record.allMeta?.variants?.[0]?.title ?? record.title ?? 'Unknown Product';
            const rawSalePrice = record.allMeta?.variants?.[0]?.prices?.salePrice;
            const salePrice = rawSalePrice ? Number(rawSalePrice) : 0;
            
            return {
                title,
                salePrice
            };
        });
        return cleanedProducts;
    }

    async verifyPricesAreSortedAscending(): Promise<{ title: string; salePrice: number }[]> {
        const [allTitles, allPrices] = await Promise.all([
            this.actions.getTextFromAll(this.productTitles),
            this.actions.getTextFromAll(this.productPrices)
        ]);
        const topTitles = allTitles.slice(0, 5);
        const topPrices = allPrices.slice(0, 5);
        console.log('\n--- 🛒 [DATA MERGE] Top 5 Products on Screen ---');
        topTitles.forEach((title, index) => {
            const price = topPrices[index] ?? 'N/A';
            console.log(`[Item ${index + 1}] Title: "${title}" | UI Price: ${price}`);
        });
        const numericPrices = topPrices.map(rawPrice => {
            const cleanString = rawPrice.replace(/[^0-9.]/g, '');
            const parsedNumber = parseFloat(cleanString);
            if (isNaN(parsedNumber)) {
            throw new Error(`[VALIDATION ERROR] Failed to parse raw price string "${rawPrice}" into a valid number.`);
            }
            return parsedNumber;
        });

        console.log(`\n[LOG] Parsed Numeric Prices for Sorting Validation:`, numericPrices);
        for (let i = 0; i < numericPrices.length - 1; i++) {
            const currentPrice = numericPrices[i]!;
            const nextPrice = numericPrices[i + 1]!;

            if (currentPrice > nextPrice) {
            throw new Error(
                `[ASSERTION FAILURE] Products are NOT sorted correctly! ` +
                `Price at index ${i} (${currentPrice}) is greater than price at index ${i + 1} (${nextPrice}).`
            );
            }
        }
        console.log('✅ [ASSERTION SUCCESS] Verification complete: The first 5 product prices are strictly sorted in ascending order.');
        await this.actions.takeScreenshot("[LiverpoolSearchResultsPage] Verification complete: The first 5 product prices are strictly sorted in ascending order.")

        return topTitles.map((title, index) => ({
            title,
            salePrice: numericPrices[index]!
        }));
    }

    /**
     * Compares UI data against Next.js hydration backend data.
     * Logs exact matches, price mismatches, or missing records due to client-side sorting/filtering.
     * @method validateUiDataWithBackendData
     * @param {Array<{title: string, salePrice: number}>} uiProducts - The list of products extracted from the UI.
     * @param {Array<{title: string, salePrice: number}>} backendProducts - The list of products extracted from the backend hydration.
     * @returns {Array<Record<string, any>>} Comparison report list for tracking.
     */
    async validateUiDataWithBackendData(
        uiProducts: { title: string; salePrice: number }[], 
        backendProducts: { title: string; salePrice: number }[]
    ): Promise<Record<string, any>[]> {
        console.log('\n--- 🔍 [HYBRID VALIDATION] Comparing UI vs Backend Hydration Data ---');
        const comparisonReport: Record<string, any>[] = [];

        uiProducts.forEach((uiItem, index) => {
            const backendMatch = backendProducts.find(
                bp => bp.title.toLowerCase().trim() === uiItem.title.toLowerCase().trim()
            );

            console.log(`\n[UI Item ${index + 1}] "${uiItem.title}"`);

            if (!backendMatch) {
                console.log(`  ⚠️  Status: NOT FOUND in Backend State`);
                console.log(`  • UI Price: $${uiItem.salePrice}`);
                
                comparisonReport.push({
                    item: index + 1,
                    title: uiItem.title,
                    status: 'NOT_FOUND_IN_BACKEND',
                    uiPrice: uiItem.salePrice,
                    backendPrice: null
                });
                return;
            }

            const priceDifference = uiItem.salePrice - backendMatch.salePrice;

            if (priceDifference === 0) {
                console.log(`  ✅ Status: MATCH`);
                console.log(`  • Price: $${uiItem.salePrice} (UI) == $${backendMatch.salePrice} (Backend)`);
                
                comparisonReport.push({
                    item: index + 1,
                    title: uiItem.title,
                    status: 'MATCH',
                    uiPrice: uiItem.salePrice,
                    backendPrice: backendMatch.salePrice
                });
            } else {
                console.log(`  ❌ Status: PRICE MISMATCH`);
                console.log(`  • UI Price:      $${uiItem.salePrice}`);
                console.log(`  • Backend Price: $${backendMatch.salePrice}`);
                
                comparisonReport.push({
                    item: index + 1,
                    title: uiItem.title,
                    status: 'PRICE_MISMATCH',
                    uiPrice: uiItem.salePrice,
                    backendPrice: backendMatch.salePrice,
                    difference: priceDifference
                });
            }
        });
        
        console.log('\n--- 🏁 [HYBRID VALIDATION] Comparison Complete ---');
        return comparisonReport;
    }
}