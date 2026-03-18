# Framework Coding Patterns Guide

## Overview

This guide documents the recommended coding patterns and best practices for using this automation framework.

## Table of Contents

1. [Page Object Model Pattern](#page-object-model-pattern)
2. [Smart Page Object Pattern](#smart-page-object-pattern)
3. [Fixture Pattern](#fixture-pattern)
4. [Test Data Pattern](#test-data-pattern)
5. [Selector Pattern](#selector-pattern)
6. [Assertion Pattern](#assertion-pattern)

---

## Page Object Model Pattern

### Concept

The Page Object Model (POM) pattern encapsulates page elements and actions into reusable classes, promoting maintainable and readable tests.

### Basic Structure

```typescript
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // 1. Define selectors as private readonly fields
  private readonly emailInput = 'input[name="email"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly loginButton = 'button[type="submit"]';
  private readonly errorMessage = '.error-message';

  constructor(page: Page) {
    super(page);
  }

  // 2. Create navigation methods
  async goto() {
    await super.goto('/login');
  }

  // 3. Create verification methods
  async verifyPageLoaded() {
    await this.expectVisible(this.emailInput, 'Email input should be visible');
  }

  // 4. Create action methods (user actions, not implementation details)
  async login(email: string, password: string) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  // 5. Create query methods (get information from page)
  getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  // 6. Create flow methods (combine multiple actions)
  async loginAsDefaultUser() {
    await this.login('user@example.com', 'password123');
    await this.waitForPageLoad();
  }
}
```

### Usage in Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.verifyPageLoaded();
    await loginPage.login('user@example.com', 'password123');

    // Verify login success
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

### Best Practices

1. **Use descriptive method names**: `login()` not `clickLoginButton()`
2. **Return page objects for navigation**: Return the new page object after navigation
3. **Keep page objects focused**: One page object per page/section
4. **Don't use assertions in page objects**: Page objects should return data, tests should assert
5. **Inherit from BasePage**: Get 50+ utility methods for free

---

## Smart Page Object Pattern

### Concept

SmartPageObject extends BasePage with auto-healing capabilities, allowing forms to be filled even when selectors change.

### Field Configuration

```typescript
import { SmartPageObject, FieldConfig } from './SmartPageObject';

export class RegistrationPage extends SmartPageObject {
  // Define field configurations with fallback selectors
  private readonly fields: Record<string, FieldConfig> = {
    email: {
      name: 'Email',
      selectors: [
        'input[name="email"]',           // First try
        'input[type="email"]',            // Fallback 1
        '[data-testid="email-input"]',    // Fallback 2
        '#email'                          // Fallback 3
      ],
      required: true,
      type: 'text'
    },
    country: {
      name: 'Country',
      selectors: [
        'select[name="country"]',
        '[data-testid="country-select"]'
      ],
      required: true,
      type: 'select'
    },
    state: {
      name: 'State',
      selectors: [
        'select[name="state"]',
        '[data-testid="state-select"]'
      ],
      required: true,
      type: 'select',
      dependsOn: ['country'] // Dependent dropdown
    }
  };

  // Smart fill with auto-healing
  async fillForm(data: any) {
    await this.smartFill(this.fields.email, data.email);
    await this.smartSelect(this.fields.country, data.country);
    await this.smartSelect(this.fields.state, data.state, {
      dependsOn: ['country'],
      waitForOptions: 1500
    });
  }
}
```

### Auto-Healing Features

1. **Multiple Selector Strategies**: Tries each selector until one works
2. **Automatic Skip**: Skips disabled/read-only fields
3. **Verification**: Verifies value was filled correctly
4. **Dependent Dropdowns**: Waits for dependent options to populate
5. **Smart Logging**: Shows which selectors worked/failed

### Usage in Tests

```typescript
test('should handle form with auto-healing', async ({ page }) => {
  const registrationPage = new RegistrationPage(page);

  const formData = {
    email: 'user@example.com',
    country: 'United States',
    state: 'California'
  };

  await registrationPage.smartFillForm(formData);

  // Form is filled even if selectors change
});
```

### Best Practices

1. **Order selectors by likelihood**: Put most likely selectors first
2. **Use data-testid**: Most reliable selector for testing
3. **Mark required fields**: Set `required: true` for mandatory fields
4. **Specify dependencies**: For cascading dropdowns
5. **Handle optional fields**: Set `required: false` for optional fields

---

## Fixture Pattern

### Concept

Fixtures provide reusable setup and teardown logic for tests, commonly used for role-based testing.

### Creating Role Fixtures

```typescript
import { test as base } from '@playwright/test';

// Define fixture type
interface AdminFixture {
  adminEmail: string;
  adminPassword: string;
}

// Create admin fixture
export const testAsAdmin = base.extend<AdminFixture>({
  adminEmail: async ({}, use) => {
    await use('admin@example.com');
  },

  adminPassword: async ({}, use) => {
    await use('admin123');
  },

  page: async ({ adminEmail, adminPassword, page }, use) => {
    // Setup: Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Use authenticated page
    await use(page);

    // Teardown: Logout
    await page.goto('/logout');
  }
});
```

### Using Fixtures

```typescript
testAsAdmin('admin can access settings', async ({ page }) => {
  // Test runs as authenticated admin
  await page.goto('/admin/settings');
  await expect(page.locator('h1')).toContainText('Admin Settings');
});
```

### Multiple Role Fixtures

```typescript
// Admin fixture
export const testAsAdmin = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);
    await use(page);
    await context.close();
  }
});

// User fixture
export const testAsUser = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsUser(page);
    await use(page);
    await context.close();
  }
});

// Guest fixture (no auth)
export const testAsGuest = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});
```

### Best Practices

1. **Use descriptive fixture names**: `testAsAdmin`, `testAsUser`
2. **Always cleanup**: Logout, close contexts, reset state
3. **Use environment variables**: Store credentials in .env
4. **Keep fixtures simple**: Focus on authentication/authorization
5. **Reuse fixtures**: Share fixtures across multiple tests

---

## Test Data Pattern

### Concept

Generate test data dynamically with counters and random values to avoid conflicts and ensure uniqueness.

### Using Test Data Generator

```typescript
import { generateTestData } from '../utils/test-data';

test('should handle dynamic test data', async ({ page }) => {
  // Generate unique test data
  const user = generateTestData({
    prefix: 'QA',
    randomValue: true,
    counter: true
  });

  // Result: QA_USER_abc123_001
  await page.fill('#username', user.username);
  await page.fill('#email', `${user.username}@example.com`);
});
```

### Custom Data Generation

```typescript
import { generateTestData } from '../utils/test-data';

function generateUserData() {
  return {
    name: generateTestData({
      prefix: 'TEST_USER',
      counter: true
    }),
    email: `test_${Date.now()}@example.com`,
    phone: `555-${Math.floor(Math.random() * 10000)}`
  };
}

test('should create new user', async ({ page }) => {
  const userData = generateUserData();

  await page.fill('#name', userData.name);
  await page.fill('#email', userData.email);
  await page.fill('#phone', userData.phone);
  await page.click('#create');

  // Verify user was created
  await expect(page.locator(`text=${userData.name}`)).toBeVisible();
});
```

### Test Data Types

```typescript
// Counter-based
const counterData = generateTestData({
  prefix: 'ORDER',
  counter: true
}); // ORDER_001, ORDER_002, etc.

// Random-based
const randomData = generateTestData({
  prefix: 'SESSION',
  randomValue: true
}); // SESSION_x7k2p9m, SESSION_q3j8k5n, etc.

// Combined
const combinedData = generateTestData({
  prefix: 'ITEM',
  randomValue: true,
  counter: true
}); // ITEM_abc123_001, ITEM_xyz789_002, etc.
```

### Best Practices

1. **Use dynamic data**: Avoid hardcoded test data
2. **Use counters**: Ensure unique sequential data
3. **Use random values**: Test edge cases and uniqueness
4. **Clean up test data**: Remove test data after tests
5. **Document data patterns**: Comment on expected formats

---

## Selector Pattern

### Concept

Use reliable, maintainable selectors that don't break easily when the UI changes.

### Selector Strategies (in order of preference)

1. **Data-testid (Best)**
   ```typescript
   const button = '[data-testid="submit-button"]';
   ```

2. **Name attribute**
   ```typescript
   const emailInput = 'input[name="email"]';
   ```

3. **ID attribute**
   ```typescript
   const submitButton = 'button#submit';
   ```

4. **Placeholder**
   ```typescript
   const nameInput = 'input[placeholder="Enter your name"]';
   ```

5. **CSS class (use with caution)**
   ```typescript
   const primaryButton = '.btn-primary';
   ```

6. **Text content (use sparingly)**
   ```typescript
   const loginLink = 'a:has-text("Login")';
   ```

### SmartPageObject Selector Pattern

```typescript
const fieldConfig: FieldConfig = {
  name: 'Email',
  selectors: [
    'input[name="email"]',           // Try name first
    'input[type="email"]',            // Fallback to type
    '[data-testid="email"]',          // Fallback to data-testid
    '#email'                          // Fallback to id
  ],
  required: true,
  type: 'text'
};
```

### Complex Selectors

```typescript
// Parent-child relationship
const submitButton = 'form button[type="submit"]';

// Multiple attributes
const emailInput = 'input[name="email"][type="email"][required]';

// Pseudo-classes
const firstItem = '.item:first-child';
const lastItem = '.item:last-child';
const visibleItem = '.item:visible';

// Combinators
const emailInForm = 'form .input-group input[name="email"]';
```

### Best Practices

1. **Use data-testid**: Most reliable selector
2. **Avoid complex CSS**: Keep selectors simple
3. **Avoid brittle selectors**: Don't use nth-child, complex xpath
4. **Provide fallbacks**: Multiple selector strategies in SmartPageObject
5. **Test selectors**: Verify selectors in browser DevTools

---

## Assertion Pattern

### Concept

Use Playwright's expect API for readable and maintainable assertions.

### Basic Assertions

```typescript
import { expect } from '@playwright/test';

// Element visibility
await expect(page.locator('#header')).toBeVisible();
await expect(page.locator('#modal')).not.toBeVisible();

// Element existence
await expect(page.locator('#content')).toHaveCount(1);

// Text content
await expect(page.locator('h1')).toHaveText('Welcome');
await expect(page.locator('.message')).toContainText('Success');

// Attribute values
await expect(page.locator('#input')).toHaveAttribute('required', '');
await expect(page.locator('#link')).toHaveAttribute('href', '/dashboard');

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/.*\/dashboard\/\d+/);

// Page title
await expect(page).toHaveTitle('Dashboard - My App');
```

### Page Object Assertions

```typescript
// In page object (query methods)
async isErrorMessageVisible(): Promise<boolean> {
  return this.isVisible(this.errorSelector);
}

async getErrorMessage(): Promise<string> {
  return this.getText(this.errorSelector);
}

// In tests (assertions)
test('should show error on invalid login', async ({ page }) => {
  await loginPage.login('invalid', 'invalid');
  await expect(await loginPage.isErrorMessageVisible()).toBe(true);
  expect(await loginPage.getErrorMessage()).toContain('Invalid credentials');
});
```

### Timeout Assertions

```typescript
// Wait for element with custom timeout
await expect(page.locator('#loading'))
  .toBeVisible({ timeout: 10000 });

// Wait for URL change
await expect(page)
  .toHaveURL(/.*\/dashboard/, { timeout: 15000 });
```

### Custom Assertions

```typescript
// Create custom matcher
expect.extend({
  toBeValidEmail(received: string) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid email`
        : `expected ${received} to be a valid email`
    };
  }
});

// Use custom assertion
await expect(userEmail).toBeValidEmail();
```

### Best Practices

1. **Use expect API**: More readable than assertions
2. **One assertion per test**: When possible
3. **Use descriptive messages**: Help with debugging
4. **Wait for conditions**: Use timeouts for async operations
5. **Test negative cases**: Verify error handling

---

## Summary

| Pattern | When to Use | Key Benefits |
|---------|-------------|--------------|
| Page Object Model | All page interactions | Maintainability, reusability |
| Smart Page Object | Complex forms, dynamic UI | Auto-healing, reduced flakiness |
| Fixture Pattern | Role-based testing | Reusable setup/teardown |
| Test Data Pattern | Dynamic data generation | Uniqueness, avoid conflicts |
| Selector Pattern | Element targeting | Reliability, maintainability |
| Assertion Pattern | Test validation | Readability, debugging |

For more examples, see the example tests in `framework-core/tests/examples/`.
