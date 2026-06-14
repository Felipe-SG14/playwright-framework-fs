import { test } from '../fixtures/framework-fixture';

test.describe('Take home challenge', () => {

  test('E2E UI Automation', async ({ pom }) => {
    await pom.liverpoolHomePage.searchProduct("playstation 5");
  });

});
  