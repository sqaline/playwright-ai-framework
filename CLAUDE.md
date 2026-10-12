# Automation Framework

Production-ready Playwright automation framework with Page Object Model, Smart Page Objects, role-based testing, and MCP integration.

## Project Structure

```
framework-core/
├── pages/                   # Page objects (POM pattern)
│   ├── BasePage.ts          # Core utilities (50+ methods)
│   ├── SmartPageObject.ts    # Auto-healing page objects
│   └── configs/             # Field configuration templates
│
├── utils/                    # Framework utilities
│   ├── test-data.ts          # Test data generation
│   ├── test-results-parser.ts # Result parsing
│   ├── api-client.ts          # API testing layer
│   ├── flaky-tracker.ts       # Flaky test tracking
│   ├── visual-comparator.ts   # Visual regression testing
│   ├── llm-summarizer.ts     # AI report generation (optional)
│   ├── types.ts              # Shared type definitions
│   └── mcp-client.ts         # MCP client integration
│
├── fixtures/                 # Role-based fixtures
│   └── base-fixtures.ts      # Pre-authenticated fixtures
│
├── tests/                     # Test suites
│   ├── examples/              # Example tests (templates)
│   └── framework-verification.spec.ts # Framework tests
│
├── scripts/                   # Utility scripts
│   ├── generate-report.ts     # Generate test reports
│   └── setup-local.ts        # Local setup
│
├── docs/                      # Documentation
│   ├── FRAMEWORK_GUIDE.md    # Main guide
│   ├── PATTERN_GUIDE.md       # Coding patterns
│   ├── UPDATE_GUIDE.md        # Framework updates
│   └── AI-WORKFLOW.md        # AI/MCP workflow
│
├── .github/                   # CI/CD
│   └── workflows/
│       └── test.yml           # GitHub Actions workflow
│
├── CLAUDE.md                 # This file - Claude Code context
├── package.json               # Dependencies & scripts
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json             # TypeScript config
├── .env.example              # Environment template
└── .gitignore                # Git ignore rules
```

## Coding Conventions

### TypeScript
- Strict mode enabled in `tsconfig.json`
- Use type annotations explicitly
- Prefer interfaces over types for extensibility
- Use `const` and `let` over `var`

### Page Object Model
- Extend `BasePage` for new page objects
- Use semantic locators (`getByRole`) only
- Encapsulate page logic within page object methods
- Page objects return Page or void, never expose Page directly

### Test Structure
- Use `@playwright/test` assertions
- Follow AAA pattern: Arrange → Act → Assert
- Use descriptive test names (what is being tested and expected outcome)
- Keep tests independent and isolated

### Naming Conventions
- Page objects: `PascalCase` ending with `Page` (e.g., `LoginPage.ts`)
- Test files: `*.spec.ts` or `*.e2e.spec.ts`
- Test functions: `camelCase` describing behavior
- Fixtures: `testAsAdmin`, `testAsUser`, `testAsGuest`

## Available Fixtures

### testAsAdmin
Use for tests requiring admin privileges:
```typescript
import { testAsAdmin } from './fixtures/base-fixtures';

testAsAdmin('admin can delete users', async ({ page }) => {
  // Admin-only test logic
});
```

### testAsUser
Use for tests requiring authenticated user access:
```typescript
import { testAsUser } from './fixtures/base-fixtures';

testAsUser('user can update profile', async ({ page }) => {
  // Authenticated user test logic
});
```

### testAsGuest
Use for tests without authentication:
```typescript
import { testAsGuest } from './fixtures/base-fixtures';

testAsGuest('guest can view public page', async ({ page }) => {
  // Unauthenticated test logic
});
```

## Locator Rules

**CRITICAL:** Only use semantic locators (`getByRole`). No CSS selectors, no XPath.

### ✅ Use (Semantic)
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Settings' })
page.getByRole('heading', { name: /welcome/i })
page.getByRole('img', { name: 'Logo' })
page.getByRole('list', { name: 'Menu items' })
```

### ❌ Never Use
```typescript
page.locator('button[type="submit"]')  // CSS selector
page.locator('#email')                  // ID selector
page.locator('.submit-btn')               // Class selector
page.xpath('//button[@type="submit"]')   // XPath
page.$('button.submit')                  // jQuery-style
page.$x('//button')                     // XPath
```

### Role Types
Common roles to use:
- `button` - Buttons
- `textbox` - Input fields
- `link` - Links
- `heading` - Headings (h1-h6)
- `img` - Images
- `list`, `listitem` - Lists
- `menu`, `menuitem` - Menus
- `navigation` - Navigation elements
- `dialog`, `alertdialog` - Modals
- `form` - Forms

## Test File Naming Convention

- Feature tests: `[feature].spec.ts` (e.g., `login.spec.ts`)
- E2E tests: `[feature].e2e.spec.ts` (e.g., `checkout.e2e.spec.ts`)
- Unit tests: `[component].unit.spec.ts` (e.g., `forms.unit.spec.ts`)
- Integration tests: `[flow].integration.spec.ts` (e.g., `auth-flow.integration.spec.ts`)

## Framework Features

### BasePage Utilities (50+ methods)
- Navigation: `goto`, `goBack`, `goForward`
- Interaction: `fill`, `click`, `selectOption`, `check`
- Visibility: `waitForElement`, `isVisible`, `isHidden`
- Assertions: `shouldHaveText`, `shouldContainText`, `shouldNotExist`
- Network: `waitForRequest`, `waitForResponse`, `interceptRequest`
- API Mocking: `mockAPI`, `unmockAPI`
- More in `pages/BasePage.ts`

### SmartPageObject Auto-Healing
- Multi-selector retry with fallback chains
- Automatic detection of disabled/read-only fields
- Smart logging and diagnostics
- Intelligent dropdown handling
- Use for complex or dynamic forms

### Flaky Test Tracking
- Automatic flaky test detection
- Built-in retries via Playwright config
- Trace recording on first retry
- JSON report generation

### API Testing
- Type-safe API client (`utils/api-client.ts`)
- GET, POST, PUT, DELETE methods
- Bearer token and API key authentication
- Response validation

### Visual Regression Testing
- Pixel-by-pixel screenshot comparison
- Baseline management
- Configurable thresholds
- JSON report output

## MCP Integration

Start MCP server for AI tools (Claude, GitHub Copilot, Cursor):
```bash
npm run mcp:start      # Normal mode
npm run mcp:debug      # Debug mode
```

AI tools can then interact with your application in real-time via Playwright MCP server (`@playwright/mcp`).

See `docs/AI-WORKFLOW.md` for AI workflow examples.

## Environment Variables

Required in `.env` file:
```bash
# Application
QA_BASE_URL=https://your-app.example.com

# Authentication
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=your-password
TEST_USER_EMAIL=user@example.com
TEST_USER_PASSWORD=your-password

# Optional - AI
OPENAI_API_KEY=your-openai-key

# Optional - API
API_KEY=your-api-key
```

## Running Tests

```bash
# All tests
npm test

# Verification tests (framework functionality)
npm run test:verification

# Example tests
npm run test:examples

# UI mode
npm run test:ui

# Headed mode
npm run test:headed

# Debug mode
npm run test:debug

# View report
npm run test:report
```

## Common Patterns

### Creating Page Object
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  private readonly submitButton = this.page.getByRole('button', { name: /submit/i });

  async submitForm() {
    await this.click(this.submitButton);
  }
}
```

### Writing Test with Fixture
```typescript
import { test, expect } from '@playwright/test';
import { testAsAdmin } from '../fixtures/base-fixtures';

testAsAdmin('admin can access settings', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});
```

### Using SmartPageObject
```typescript
import { SmartPageObject, FieldConfig } from './SmartPageObject';

export class FormPage extends SmartPageObject {
  private readonly fields: Record<string, FieldConfig> = {
    email: {
      name: 'Email',
      selectors: ['input[name="email"]', 'input[type="email"]'],
      required: true,
      type: 'text'
    }
  };

  async fillForm(data: any) {
    await this.smartFill(this.fields.email, data.email);
  }
}
```

## Documentation

- **[Framework Guide](docs/FRAMEWORK_GUIDE.md)** - Complete framework documentation
- **[Pattern Guide](docs/PATTERN_GUIDE.md)** - Coding patterns and best practices
- **[Update Guide](docs/UPDATE_GUIDE.md)** - How to update framework
- **[AI Workflow](docs/AI-WORKFLOW.md)** - AI/MCP integration guide
- **[Changelog](CHANGELOG.md)** - Version history
- **[README](README.md)** - Quick start guide
