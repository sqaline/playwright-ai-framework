import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * ExamplePage - Demonstrates basic Page Object Model pattern
 * Extends BasePage to inherit all common utilities
 *
 * This is a minimal example showing how to create a page object for your application
 */
export class ExamplePage extends BasePage {
  // Define your page-specific selectors here
  private readonly pageTitleSelector = 'h1';
  private readonly welcomeMessageSelector = '.welcome-message';
  private readonly navigationMenuSelector = 'nav';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to example page
   */
  async goto(): Promise<void> {
    await super.goto('/example');
  }

  /**
   * Verify page is loaded by checking for key elements
   */
  async verifyPageLoaded(): Promise<void> {
    await this.expectVisible(this.pageTitleSelector);
  }

  /**
   * Get page title text
   */
  async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitleSelector);
  }

  /**
   * Check if welcome message is displayed
   */
  isWelcomeMessageVisible(): Promise<boolean> {
    return this.isVisible(this.welcomeMessageSelector);
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getText(this.welcomeMessageSelector);
  }

  /**
   * Navigate to a section using the navigation menu
   */
  async navigateToSection(sectionName: string): Promise<void> {
    const sectionLink = this.page.locator(`${this.navigationMenuSelector} a:has-text("${sectionName}")`);
    await this.click(sectionLink);
    await this.waitForPageLoad();
  }

  /**
   * Example: Click a button and wait for result
   */
  async clickButtonAndWaitForResult(buttonText: string, expectedText: string): Promise<void> {
    const button = this.page.locator(`button:has-text("${buttonText}")`);
    await this.click(button);

    // Wait for result to appear
    const resultLocator = this.page.locator(`:has-text("${expectedText}")`).first();
    await this.expectVisible(resultLocator);
  }

  /**
   * Example: Fill a form field
   */
  async fillFormField(fieldName: string, value: string): Promise<void> {
    const field = this.page.locator(`[name="${fieldName}"], [id="${fieldName}"]`).first();
    await this.fill(field, value);
  }

  /**
   * Example: Submit a form
   */
  async submitForm(): Promise<void> {
    const submitButton = this.page.locator('button[type="submit"], input[type="submit"]').first();
    await this.click(submitButton);
    await this.waitForPageLoad();
  }
}
