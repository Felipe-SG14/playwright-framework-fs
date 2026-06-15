import { test } from '../fixtures/framework-fixture';
import { COLOR_FILTERS, ORDER_BY_OPTIONS } from '../setup/constants';

test.describe('Take home challenge - Data Driven E2E Suite', () => {

  const searchTestCases = [
    { 
      consoleName: 'PlayStation 5', 
      searchQuery: 'playstation 5', 
      colorFilter: COLOR_FILTERS.WHITE_COLOR_FILTER 
    },
    { 
      consoleName: 'Xbox Series X', 
      searchQuery: 'xbox series x', 
      colorFilter: COLOR_FILTERS.BLACK_COLOR_FILTER 
    },
    { 
      consoleName: 'Nintendo Switch', 
      searchQuery: 'nintendo switch', 
      colorFilter: COLOR_FILTERS.RED_COLOR_FILTER 
    }
  ];

  test.beforeEach(async ({ pom }) => {
    await pom.liverpoolHomePage.navigateToHomePage();
  });

  for (const { consoleName, searchQuery, colorFilter } of searchTestCases) {
    test(`E2E UI Automation - Search, Filter and Sort for: ${consoleName}`, async ({ pom }) => {
      await pom.liverpoolHomePage.searchProduct(searchQuery);
      await pom.liverpoolSearchResultsPage.waitForSearchResultPageToBeDisplayed();
      await pom.liverpoolSearchResultsPage.filterByColor(colorFilter);
      await pom.liverpoolSearchResultsPage.orderProductsBy(ORDER_BY_OPTIONS.ORDER_BY_LOWEST_TO_HIGHER_PRICE_OPTION);
      const uiData = await pom.liverpoolSearchResultsPage.verifyPricesAreSortedAscending();
      const backendData = await pom.liverpoolSearchResultsPage.getProductsRecords();
      await pom.liverpoolSearchResultsPage.validateUiDataWithBackendData(uiData, backendData);
    });
  }
});