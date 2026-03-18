import { test, expect } from '@playwright/test';
import { ExamplePage } from '../../pages/examples/ExamplePage';

/**
 * Basic Page Object Pattern Example
 *
 * This test demonstrates:
 * 1. How to create a page object extending BasePage
 * 2. How to use inherited utility methods (click, fill, getText, etc.)
 * 3. How to structure page-specific methods
 * 4. How to use assertions with page objects
 */
test.describe('Basic Page Object Pattern', () => {
  let examplePage: ExamplePage;

  test.beforeEach(async ({ page }) => {
    examplePage = new ExamplePage(page);
    await examplePage.goto();
    await examplePage.verifyPageLoaded();
  });

  test('should display page title', async ({ page }) => {
    const title = await examplePage.getPageTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display welcome message', async ({ page }) => {
    const isVisible = await examplePage.isWelcomeMessageVisible();
    expect(isVisible).toBe(true);

    const message = await examplePage.getWelcomeMessage();
    expect(message).toBeTruthy();
  });

  test('should navigate to different sections', async ({ page }) => {
    await examplePage.navigateToSection('About');
    await expect(page).toHaveURL(/.*about/);

    await examplePage.navigateToSection('Contact');
    await expect(page).toHaveURL(/.*contact/);
  });

  test('should fill form and submit', async ({ page }) => {
    await examplePage.fillFormField('name', 'John Doe');
    await examplePage.fillFormField('email', 'john@example.com');
    await examplePage.submitForm();

    // Wait for success message or result
    await expect(page.locator(':has-text("Success")').first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle button clicks and results', async ({ page }) => {
    await examplePage.clickButtonAndWaitForResult('Submit', 'Form submitted successfully');
  });

  test('should demonstrate error handling', async ({ page }) => {
    // Try to submit without required fields
    await examplePage.submitForm();

    // Check for error message
    const errorSelector = '.error-message, [role="alert"]';
    const errorMessage = await examplePage.getText(errorSelector);
    expect(errorMessage).toContain('required');
  });
});

/**
 * Tips for creating your own page objects:
 *
 * 1. Extend BasePage to get all utility methods
 * 2. Define selectors as private readonly fields
 * 3. Create methods for page-specific actions
 * 4. Always verify page is loaded before interacting
 * 5. Use descriptive method names that reflect user actions
 * 6. Keep page methods focused and single-responsibility
 */
