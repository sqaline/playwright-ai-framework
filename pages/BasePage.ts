import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - Base class for all page objects
 * Provides common utilities and helper methods for page interactions
 */
export class BasePage {
  readonly page: Page;
  readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.QA_BASE_URL || (() => {
      throw new Error('QA_BASE_URL is not set in .env file. Please copy .env.example to .env and set QA_BASE_URL to your application URL.');
    })();
  }

  /**
   * Navigate to a specific path relative to base URL
   */
  async goto(path: string = ''): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Click on an element
   */
  async click(selector: string | Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.click(selector, options);
    } else {
      await selector.click(options);
    }
  }

  /**
   * Fill input field
   */
  async fill(selector: string | Locator, value: string, options?: { timeout?: number }): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.fill(selector, value, options);
    } else {
      await selector.fill(value, options);
    }
  }

  /**
   * Clear and fill input field
   */
  async clearAndFill(selector: string | Locator, value: string): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.locator(selector).clear();
      await this.page.fill(selector, value);
    } else {
      await selector.clear();
      await selector.fill(value);
    }
  }

  /**
   * Get text content of an element
   */
  async getText(selector: string | Locator): Promise<string> {
    if (typeof selector === 'string') {
      return await this.page.textContent(selector) || '';
    } else {
      return await selector.textContent() || '';
    }
  }

  /**
   * Get inner text of an element
   */
  async getInnerText(selector: string | Locator): Promise<string> {
    if (typeof selector === 'string') {
      return await this.page.innerText(selector);
    } else {
      return await selector.innerText();
    }
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string | Locator): Promise<boolean> {
    try {
      if (typeof selector === 'string') {
        return await this.page.locator(selector).isVisible();
      } else {
        return await selector.isVisible();
      }
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector: string | Locator): Promise<boolean> {
    try {
      if (typeof selector === 'string') {
        return await this.page.locator(selector).isEnabled();
      } else {
        return await selector.isEnabled();
      }
    } catch {
      return false;
    }
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string | Locator, value: string | { label?: string; value?: string }): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.selectOption(selector, value);
    } else {
      await selector.selectOption(value);
    }
  }

  /**
   * Check checkbox or radio button
   */
  async check(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.check(selector);
    } else {
      await selector.check();
    }
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.uncheck(selector);
    } else {
      await selector.uncheck();
    }
  }

  /**
   * Hover over an element
   */
  async hover(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.hover(selector);
    } else {
      await selector.hover();
    }
  }

  /**
   * Double click on an element
   */
  async doubleClick(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.dblclick(selector);
    } else {
      await selector.dblclick();
    }
  }

  /**
   * Type text into an element (with optional delay)
   */
  async type(selector: string | Locator, text: string, options?: { delay?: number }): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.type(selector, text, options);
    } else {
      await selector.type(text, options);
    }
  }

  /**
   * Press a key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(options?: { url?: string; timeout?: number }): Promise<void> {
    await this.page.waitForURL(options?.url || '**', { timeout: options?.timeout });
  }

  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take screenshot
   */
  async screenshot(path: string): Promise<void> {
    await this.page.screenshot({ path });
  }

  /**
   * Wait for a specific amount of time (use sparingly)
   */
  async wait(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Get locator
   */
  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get all matching locators
   */
  locators(selector: string): Promise<Locator[]> {
    return this.page.locator(selector).all();
  }

  /**
   * Wait for element to be attached to DOM
   */
  async waitForElement(selector: string | Locator, timeout?: number): Promise<Locator> {
    if (typeof selector === 'string') {
      await this.page.waitForSelector(selector, { timeout });
      return this.page.locator(selector);
    } else {
      await selector.waitFor({ timeout });
      return selector;
    }
  }

  /**
   * Assert element is visible
   */
  async expectVisible(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await expect(this.page.locator(selector)).toBeVisible();
    } else {
      await expect(selector).toBeVisible();
    }
  }

  /**
   * Assert element contains text
   */
  async expectText(selector: string | Locator, text: string | RegExp): Promise<void> {
    if (typeof selector === 'string') {
      await expect(this.page.locator(selector)).toContainText(text);
    } else {
      await expect(selector).toContainText(text);
    }
  }

  /**
   * Assert URL contains path
   */
  async expectURL(url: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  /**
   * Wait for API response
   */
  async waitForResponse(urlPattern: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForResponse(urlPattern, options);
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(options?: { timeout?: number }): Promise<void> {
    await this.page.waitForLoadState('networkidle', options);
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.locator(selector).scrollIntoViewIfNeeded();
    } else {
      await selector.scrollIntoViewIfNeeded();
    }
  }

  /**
   * Get attribute value
   */
  async getAttribute(selector: string | Locator, attribute: string): Promise<string | null> {
    if (typeof selector === 'string') {
      return await this.page.locator(selector).getAttribute(attribute);
    } else {
      return await selector.getAttribute(attribute);
    }
  }

  /**
   * Get input value
   */
  async getInputValue(selector: string | Locator): Promise<string> {
    if (typeof selector === 'string') {
      return await this.page.locator(selector).inputValue();
    } else {
      return await selector.inputValue();
    }
  }

  /**
   * Count matching elements
   */
  async count(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  /**
   * Focus on element
   */
  async focus(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.locator(selector).focus();
    } else {
      await selector.focus();
    }
  }

  /**
   * Blur element (remove focus)
   */
  async blur(selector: string | Locator): Promise<void> {
    if (typeof selector === 'string') {
      await this.page.locator(selector).blur();
    } else {
      await selector.blur();
    }
  }


}

/**
 * Retry action with backoff
 */
export async function retryWithBackoff<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}

/**
 * Wait for toast/notification message
 */
export async function waitForToast(page: Page, expectedText?: string | RegExp): Promise<string> {
  const toastSelectors = [
    '[role="alert"]',
    '.toast',
    '.notification',
    '.snackbar',
    '[data-testid="toast"]',
  ];

  for (const selector of toastSelectors) {
    const toast = page.locator(selector).first();
    if (await toast.isVisible({ timeout: 1000 }).catch(() => false)) {
      const text = (await toast.textContent()) || '';
      if (expectedText) {
        if (typeof expectedText === 'string') {
          expect(text).toContain(expectedText);
        } else {
          expect(text).toMatch(expectedText);
        }
      }
      return text;
    }
  }

  throw new Error('No toast/notification found');
}

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: any,
  status = 200
): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Dismiss modal/dialog if present
 */
export async function dismissModalIfPresent(page: Page): Promise<boolean> {
  const closeButtons = [
    'button[aria-label="Close"]',
    'button:has-text("Close")',
    'button:has-text("Cancel")',
    '[data-testid="close-modal"]',
    '.modal-close',
  ];

  for (const selector of closeButtons) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
      await button.click();
      return true;
    }
  }

  return false;
}