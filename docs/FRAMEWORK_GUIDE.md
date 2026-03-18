# Automation Framework Guide

## Overview

This is a reusable Playwright automation framework that provides a solid foundation for creating test automation projects. It includes:

- **Page Object Model** architecture with base utilities
- **Smart Page Objects** with auto-healing capabilities
- **Role-based fixtures** for different user types
- **Test data generation utilities**
- **AI-powered reporting** (optional)
- **Comprehensive documentation and examples**

## Quick Start

### 1. Initialize a New Project

```bash
# Navigate to your new project directory
cd /path/to/new/project

# Run the initialization script
npx ts-node /path/to/automation-framework/tools/init-new-project.ts
```

The script will prompt you for:
- Project name
- Description
- Default base URL
- Whether to include example tests
- Whether to install dependencies

### 2. Configure Environment

After initialization, edit the `.env` file:

```bash
# Application Configuration
QA_BASE_URL=https://your-app.example.com

# Authentication (customize for your app)
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin123
TEST_USER_EMAIL=user@example.com
TEST_USER_PASSWORD=user123

# Additional application-specific variables
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Install Playwright Browsers

```bash
npx playwright install
```

### 5. Run Example Tests

```bash
npm test
```

## Architecture

The framework follows a layered architecture:

```
framework-core/
├── pages/
│   ├── BasePage.ts              # Core utilities and common methods
│   ├── SmartPageObject.ts       # Auto-healing page object
│   ├── configs/                 # Field configuration templates
│   └── examples/                # Example page objects
├── utils/
│   ├── test-data.ts            # Test data generation
│   ├── test-results-parser.ts  # Result parsing
│   └── llm-summarizer.ts      # AI reporting (optional)
├── fixtures/
│   └── base-fixtures.ts       # Role-based fixture patterns
├── scripts/
│   ├── generate-report.ts      # Report generation
│   └── setup-local.ts         # Local setup
└── tests/
    └── examples/              # Example tests
```

### Layer 1: BasePage

The `BasePage` class provides common utilities for all page interactions:

```typescript
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  async fillForm(data: FormData) {
    await this.fill('#name', data.name);
    await this.fill('#email', data.email);
    await this.click('#submit');
  }
}
```

### Layer 2: SmartPageObject

The `SmartPageObject` extends `BasePage` with auto-healing capabilities:

```typescript
import { SmartPageObject, FieldConfig } from './SmartPageObject';

export class SmartFormPage extends SmartPageObject {
  private fields: Record<string, FieldConfig> = {
    name: {
      name: 'Name',
      selectors: ['input[name="name"]', 'input[id="name"]'],
      required: true,
      type: 'text'
    }
  };

  async fillForm(data: any) {
    await this.smartFill(this.fields.name, data.name);
  }
}
```

### Layer 3: Page Objects

Create application-specific page objects by extending BasePage or SmartPageObject:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  private readonly emailInput = 'input[name="email"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly loginButton = 'button[type="submit"]';

  async login(email: string, password: string) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
```

## Key Features

### 1. BasePage Utilities

`BasePage` provides 50+ utility methods for common interactions:

```typescript
// Navigation
await page.goto('/dashboard');
await page.waitForPageLoad();

// Element interactions
await page.click('#submit');
await page.fill('#email', 'user@example.com');
await page.selectOption('#country', 'United States');

// Visibility checks
await page.isVisible('#modal');
await page.isEnabled('#submit');

// Assertions
await page.expectVisible('#success-message');
await page.expectText('#welcome', 'Hello, User');

// Waits
await page.waitForVisible('#loading', 5000);
await page.waitForNetworkIdle();
```

### 2. SmartPageObject Auto-Healing

Automatically tries multiple selectors and skips disabled fields:

```typescript
const fieldConfig: FieldConfig = {
  name: 'Email',
  selectors: [
    'input[name="email"]',
    'input[type="email"]',
    '[data-testid="email"]'
  ],
  required: true,
  type: 'text'
};

await this.smartFill(fieldConfig, 'user@example.com');
```

### 3. Role-Based Fixtures

Create fixtures for different user roles:

```typescript
const base = test.extend<Page>({});

export const testAsAdmin = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);
    await use(page);
    await context.close();
  }
});

testAsAdmin('can access admin settings', async ({ page }) => {
  // Test code
});
```

### 4. Test Data Generation

Generate test data with counters and random values:

```typescript
import { generateTestData } from './utils/test-data';

const data = generateTestData({
  prefix: 'QA',
  randomValue: true,
  counter: true
});

// Result: QA_USER_001, QA_USER_002, etc.
```

## Best Practices

### 1. Page Object Model

- Each page should be a separate class
- Extend BasePage or SmartPageObject
- Keep selectors as private readonly fields
- Create methods for user actions, not implementation details
- Return page objects for navigation flows

### 2. Selector Strategies

- Use data-testid attributes for stability
- Provide fallback selectors in SmartPageObject
- Avoid brittle selectors (complex CSS, XPath)
- Keep selectors simple and maintainable

### 3. Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep tests independent
- One assertion per test when possible

### 4. Configuration

- Store configuration in .env files
- Use environment-specific configs
- Never commit .env files
- Provide .env.example as template

## Common Tasks

### Create a New Page Object

```bash
# Create page object file
touch pages/MyNewPage.ts
```

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyNewPage extends BasePage {
  // Define selectors
  private readonly title = 'h1';

  // Define methods
  async verifyLoaded() {
    await this.expectVisible(this.title);
  }
}
```

### Create a New Test

```bash
# Create test file
touch tests/my-feature.spec.ts
```

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-feature');
    await expect(page.locator('h1')).toHaveText('My Feature');
  });
});
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test my-feature.spec.ts

# Run in headed mode
npm run test:headed

# Run with UI
npm run test:ui

# Run in debug mode
npm run test:debug

# View test report
npm run test:report

# Record new tests
npm run test:codegen
```

## Troubleshooting

### Tests failing randomly?

- Use SmartPageObject for auto-healing selectors
- Increase timeouts with `await page.waitForVisible(selector, 10000)`
- Check for timing issues with `await page.waitForPageLoad()`

### Selectors not working?

- Verify selectors using browser DevTools
- Try different selector strategies
- Use data-testid attributes in your application
- Add fallback selectors in SmartPageObject

### Flaky tests?

- Avoid hard-coded waits - use waitForVisible instead
- Check for async operations completing
- Verify page state before assertions
- Use expect with timeouts

## Next Steps

1. Review the example tests in `tests/examples/`
2. Study the pattern guide in `docs/PATTERN_GUIDE.md`
3. Create your first page object
4. Write your first test
5. Set up CI/CD integration

## Getting Help

- Check the examples in `framework-core/tests/examples/`
- Review the pattern guide
- Look at the example page objects
- Check Playwright documentation: https://playwright.dev
