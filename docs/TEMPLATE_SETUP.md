# Template Setup Guide

Quick start guide for using the Playwright automation framework template.

## Step 1: Copy Framework

```bash
# Copy entire framework-core directory to your new project
cp -r /path/to/framework-core /path/to/my-new-automation

# Navigate to your project
cd /path/to/my-new-automation
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Install Playwright Browsers

```bash
npx playwright install
```

## Step 4: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your application details
```

**Required in .env:**
```bash
QA_BASE_URL=https://your-app-url.com
```

**Optional in .env:**
```bash
# Test credentials
TEST_ADMIN_EMAIL=admin@your-app.com
TEST_ADMIN_PASSWORD=your-password

# Test email configuration (for test data generation)
TEST_EMAIL_DOMAIN=your-test-domain.com
```

## Step 5: Create Your First Page Object

**Create `pages/YourPage.ts`:**
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class YourPage extends BasePage {
  private readonly submitButton = this.page.getByRole('button', { name: /submit/i });

  async submitForm() {
    await this.click(this.submitButton);
  }
}
```

## Step 6: Create Your First Test

**Create `tests/your-page.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test';
import { YourPage } from '../pages/YourPage';

test('should submit form', async ({ page }) => {
  const yourPage = new YourPage(page);
  await page.goto('/your-page');
  await yourPage.submitForm();
});
```

## Step 7: Run Your Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/your-page.spec.ts

# Run in UI mode
npm run test:ui
```

---

## Quick Reference

**Run specific browser:**
```bash
# Chrome (default)
npm test

# Firefox (uncomment in playwright.config.ts first)
npm test --project=firefox

# Safari (uncomment in playwright.config.ts first)
npm test --project=webkit
```

**View test report:**
```bash
npm run test:report
```

---

## Next Steps

- Read `docs/PATTERN_GUIDE.md` for coding patterns
- Use `npm run mcp:start` to enable AI-assisted page object generation
- Check `docs/AI-WORKFLOW.md` for AI workflows
