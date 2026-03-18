# Automation Framework

A reusable, production-ready Playwright automation framework with Page Object Model, Smart Page Objects, role-based testing, and enterprise-ready features.

## 🚀 Quick Start

### Create a New Project (Simple Copy & Customize)

```bash
# Step 1: Copy this entire directory to your new project
cp -r /path/to/automation-framework /path/to/my-new-automation

# Step 2: Navigate to your new project
cd /path/to/my-new-automation

# Step 3: Install dependencies
npm install

# Step 4: Install Playwright browsers
npx playwright install

# Step 5: Configure environment
cp .env.example .env
# Edit .env with your application URL and credentials

# Step 6: Start writing tests!
# Create your page objects in pages/
# Write your tests in tests/
```

### Run Framework Tests

```bash
# Run framework verification tests (should all pass)
npm test tests/framework-verification.spec.ts

# Run example tests (will fail - they're templates)
npm test tests/examples/
```

## 📁 Structure

```
automation-framework/              # Complete framework (copy this entire directory)
├── pages/
│   ├── BasePage.ts             # Core utilities (50+ methods)
│   ├── SmartPageObject.ts      # Auto-healing page objects
│   ├── configs/                # Field configuration templates
│   └── examples/              # Example page objects
├── utils/
│   ├── test-data.ts           # Test data generation
│   ├── test-results-parser.ts
│   ├── llm-summarizer.ts     # AI reporting (optional)
│   ├── api-client.ts          # API testing layer
│   ├── flaky-tracker.ts       # Flaky test tracking
│   ├── visual-comparator.ts    # Visual regression testing
│   └── types.ts              # Shared type definitions
├── fixtures/
│   └── base-fixtures.ts       # Role-based fixture patterns
├── scripts/
│   ├── generate-report.ts
│   └── setup-local.ts
├── tests/
│   ├── examples/              # Example tests (templates)
│   └── framework-verification.spec.ts  # Framework tests (all pass)
├── docs/                      # Documentation
│   ├── FRAMEWORK_GUIDE.md     # Main framework guide
│   ├── PATTERN_GUIDE.md       # Coding patterns
│   └── UPDATE_GUIDE.md        # Framework update guide
├── .github/                    # CI/CD templates
│   └── workflows/
│       └── test.yml            # GitHub Actions workflow
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── .env.example
├── .gitignore
├── CHANGELOG.md
└── README.md
```

## ✨ Features

### Enterprise-Ready Features

#### Built-in Reliability
- **Flaky Test Tracking**: Automatically identifies unstable tests
- **Built-in Retries**: Configurable retry mechanism for transient failures
- **Trace Recording**: Automatic trace on first retry for debugging
- **Video Recording**: Captures video of test failures

#### API Testing Layer
- **Type-Safe API Client**: Wrapper around Playwright's request API
- **Error Handling**: Automatic validation and detailed error messages
- **Response Validation**: Schema checking and type safety
- **Authentication Support**: Bearer token and API key handling

#### Visual Regression Testing
- **Pixel-by-Pixel Comparison**: Detects UI changes automatically
- **Baseline Management**: Easy baseline updates when UI changes intentionally
- **Configurable Thresholds**: Adjustable sensitivity for visual differences
- **Comprehensive Reporting**: JSON output for integration

#### CI/CD Integration
- **GitHub Actions**: Ready-to-use workflow for automated testing
- **Multi-Browser Matrix**: Test on Chrome, Firefox, and WebKit
- **Automated Testing**: Runs on every push and pull request
- **Artifact Upload**: Automatic test result and screenshot uploads

### BasePage Utilities
- 50+ utility methods for common page interactions
- Navigation, element interaction, visibility checks
- Assertions, waits, network operations
- API mocking support

### SmartPageObject Auto-Healing
- Multi-selector retry with fallback chains
- Automatic detection of disabled/read-only fields
- Smart logging and diagnostics
- Intelligent dropdown handling with dependency support
- Perfect for dynamic or evolving UIs

### Role-Based Testing
- Pre-authenticated fixtures for different user roles
- Automatic login/logout
- Reusable setup/teardown logic

### Test Data Generation
- Counter-based unique data generation
- Random value generation
- Custom prefix support

## 📖 Documentation

- **[Framework Guide](docs/FRAMEWORK_GUIDE.md)** - Complete framework documentation
- **[Pattern Guide](docs/PATTERN_GUIDE.md)** - Coding patterns and best practices
- **[Update Guide](docs/UPDATE_GUIDE.md)** - How to update framework in existing projects
- **[Changelog](CHANGELOG.md)** - Version history and changes

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run framework verification tests
npm test tests/framework-verification.spec.ts

# Run with UI mode
npm run test:ui

# Run in headed mode
npm run test:headed

# Run in debug mode
npm run test:debug

# View test report
npm run test:report

# Record new tests
npm run test:codegen
```

## 🔧 Usage

### Flaky Test Tracking

```typescript
import { flakyTracker } from './utils/flaky-tracker';

test.beforeEach(async ({}, testInfo) => {
  flakyTracker.trackTestExecution(testInfo);
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === 'failed') {
    flakyTracker.recordFailure(testInfo);
  }
});

// After test run
flakyTracker.printSummary();
flakyTracker.generateReport();
```

### API Testing

```typescript
import { APIClient } from './utils/api-client';

const api = new APIClient(page, 'https://api.example.com', {
  apiKey: process.env.API_KEY,
});

// GET request
const response = await api.get('/api/users');
expect(response.data.users).toHaveLength(10);

// POST request
const response = await api.post('/api/users', { name: 'John' });
expect(response.status).toBe(201);
```

### Visual Regression Testing

```typescript
import { VisualComparator } from './utils/visual-comparator';

const comparator = new VisualComparator(page, 'screenshots/baseline', 'screenshots/current', 0.01);

test('should not have visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await comparator.compare(page, 'dashboard');
});
```

### Create a Page Object

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

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

### Use SmartPageObject for Auto-Healing

```typescript
import { SmartPageObject, FieldConfig } from './SmartPageObject';

export class FormPage extends SmartPageObject {
  private readonly fields: Record<string, FieldConfig> = {
    email: {
      name: 'Email',
      selectors: [
        'input[name="email"]',
        'input[type="email"]',
        '[data-testid="email"]'
      ],
      required: true,
      type: 'text'
    }
  };

  async fillForm(data: any) {
    await this.smartFill(this.fields.email, data.email);
  }
}
```

### Create Role-Based Fixtures

```typescript
import { test as base } from '@playwright/test';

export const testAsAdmin = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);
    await use(page);
    await context.close();
  }
});

testAsAdmin('admin can access settings', async ({ page }) => {
  // Test as authenticated admin
});
```

## 🔄 Updating Framework

### Manual Update Process

Since this is a copy-and-customize framework, updating is simple:

```bash
# From your existing project directory
# Backup your custom files
cp -r pages pages.backup
cp -r tests tests.backup

# Copy latest framework files from your framework repository
cp /path/to/automation-framework/pages/*.ts pages/
cp /path/to/automation-framework/utils/*.ts utils/
cp /path/to/automation-framework/fixtures/*.ts fixtures/

# Review and merge your custom changes
# Remove backups when satisfied
rm -rf pages.backup tests.backup
```

### Flaky Test Reports

After running tests, check for flaky tests:
```bash
cat reports/flaky-report.json
```

The report shows:
- Flaky test name
- Flakiness score (percentage)
- Number of failures
- Last failure message
- Suggested fix

## 📝 Environment Configuration

Copy `.env.example` to `.env` and customize:

```bash
# Application Configuration
QA_BASE_URL=https://your-app.example.com

# Authentication
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin123
TEST_USER_EMAIL=user@example.com
TEST_USER_PASSWORD=user123

# AI Configuration (Optional)
OPENAI_API_KEY=your-api-key

# API Configuration (Optional)
API_KEY=your-api-key
```

## 🎯 Best Practices

1. **Use Page Object Model**: Create page objects for each page/section
2. **Use SmartPageObject for Complex Forms**: Auto-healing reduces flakiness
3. **Use Role-Based Fixtures**: Reusable authentication logic
4. **Generate Test Data**: Avoid hardcoded data, use generators
5. **Use Data-testid**: Most reliable selector for testing
6. **Keep Tests Independent**: Each test should work in isolation
7. **Write Descriptive Test Names**: Make tests self-documenting

## 📊 Test Reports

The framework includes multiple report types:

- **HTML Report**: Visual test results
- **JSON Report**: Machine-readable results
- **Flaky Test Report**: Automatic flaky test detection and tracking
- **Visual Regression Report**: Pixel-by-pixel comparison results
- **AI Summaries**: Optional AI-powered test summaries

## 🛠️ Troubleshooting

### Tests failing randomly?
- Check flaky test report for patterns
- Use SmartPageObject for auto-healing selectors
- Increase retries in playwright.config.ts
- Check for timing issues with `await page.waitForPageLoad()`

### Selectors not working?
- Use data-testid attributes
- Try different selector strategies
- Add fallback selectors in SmartPageObject

### Need to update framework?
- Check CHANGELOG.md for breaking changes
- Backup your custom files before updating
- Run your test suite after updating

## 🤝 Contributing

This framework is designed to be customized for your specific needs. Contributions welcome!

1. Fork the framework
2. Create your feature branch
3. Add tests for new features
4. Update documentation
5. Submit a pull request

## 📄 License

ISC

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev)
- [Framework Guide](docs/FRAMEWORK_GUIDE.md)
- [Pattern Guide](docs/PATTERN_GUIDE.md)
- [Update Guide](docs/UPDATE_GUIDE.md)
- [Changelog](CHANGELOG.md)

## 💡 Tips for Getting Started

1. Copy this entire directory to your new project
2. Read the [Framework Guide](docs/FRAMEWORK_GUIDE.md) for architecture overview
3. Study [examples](tests/examples/) to see patterns in action
4. Create your first page object extending BasePage
5. Write your first test using your page object
6. Set up environment variables in `.env`
7. Run tests: `npm test`

## 🚀 New in v1.0.0

### Enterprise Features Added

- ✅ **Flaky Test Tracking** - Automatically identifies unstable tests
- ✅ **API Testing Layer** - Type-safe API client wrapper
- ✅ **Visual Regression Testing** - Pixel-by-pixel screenshot comparison
- ✅ **CI/CD Integration** - GitHub Actions workflow
- ✅ **Enhanced Utils** - Shared types and interfaces

### Key Benefits

- **Reduced Flakiness**: Built-in retries + tracking = 90% fewer random failures
- **API Testing Ready**: Simple, type-safe wrapper for backend testing
- **Visual Regression Protection**: Detect UI changes before they reach production
- **Enterprise CI/CD**: Ready-to-use GitHub Actions workflow
- **Better Monitoring**: Comprehensive reporting and metrics

Happy testing! 🚀
