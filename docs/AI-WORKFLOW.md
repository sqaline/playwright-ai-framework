# AI Workflow Guide

This guide shows how to use AI tools (Claude, GitHub Copilot, Cursor) with the Playwright MCP server to generate page objects and tests.

## Starting the MCP Server

Start the MCP server to enable AI tools to interact with your application:

```bash
# Normal mode
npm run mcp:start

# Debug mode (verbose logging)
npm run mcp:debug
```

Keep the MCP server running while working with AI tools.

## Example 1: Generate Page Object with Claude

**Prompt:**
```
Navigate to https://app.example.com/login, inspect the login form using the accessibility tree, then generate a LoginPage POM using our BasePage pattern at pages/LoginPage.ts.
```

**Expected Output:**
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

## Example 2: Write Test with Cursor

**Prompt:**
```
Look at the current page structure and write a test in tests/e2e/ that covers the happy path using our adminPage fixture.
```

**Expected Output:**
```typescript
import { test, expect } from '@playwright/test';
import { testAsAdmin } from '../fixtures/base-fixtures';

testAsAdmin('admin can access dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

## Example 3: Debug Locator Issues

**Prompt:**
```
My test is failing on the submit button locator "button[type='submit']". Use MCP to navigate to https://app.example.com/login and find the correct getByRole locator for the submit button.
```

**Expected Output:**
```
The correct locator is:
page.getByRole('button', { name: /submit/i })

Or if it's a login button:
page.getByRole('button', { name: /log in/i })
```

## AI-Generated Test Rules

When asking AI to generate tests, enforce these rules:

### 1. Use Semantic Locators Only
**✅ Do:**
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Settings' })
```

**❌ Don't:**
```typescript
page.locator('button[type="submit"]')
page.locator('#email')
page.locator('.submit-btn')
page.xpath('//button[@type="submit"]')
```

### 2. Use Fixtures from base-fixtures.ts
Always use role-based fixtures:
- `testAsAdmin` - For admin-only tests
- `testAsUser` - For authenticated user tests
- `testAsGuest` - For unauthenticated access tests

### 3. Follow AAA Pattern
All tests must follow Arrange/Act/Assert pattern:
```typescript
test('example test', async ({ page }) => {
  // Arrange - Setup test data and conditions
  const testData = { name: 'Test User' };

  // Act - Perform the action being tested
  await page.fill('[name="name"]', testData.name);
  await page.click('button[type="submit"]');

  // Assert - Verify expected outcome
  await expect(page.getByText('Success')).toBeVisible();
});
```

### 4. Page Object Model
Always interact with pages through page objects, never directly with selectors in tests:
```typescript
// ✅ Do - Use page object
await loginPage.login('user@example.com', 'password');

// ❌ Don't - Direct selector interaction
await page.fill('input[name="email"]', 'user@example.com');
await page.fill('input[name="password"]', 'password');
```

## MCP Tools Available

When MCP server is running, AI can use:

- **mcp_navigate** - Navigate to URL
- **mcp_screenshot** - Take screenshot with hidden elements
- **mcp_click** - Click element by text or selector
- **mcp_fill** - Fill form field by label
- **mcp_get_by_role** - Get element by role and name
- **mcp_wait_for** - Wait for element state
- **mcp_get_accessibility_tree** - Get page accessibility tree
- **mcp_execute_script** - Execute JavaScript

## Best Practices

1. **Start MCP before AI session** - Always start `npm run mcp:start` before using AI tools
2. **Be specific in prompts** - Include page URLs, expected outcomes, and framework conventions
3. **Review generated code** - AI can make mistakes - always verify locators and structure
4. **Use accessibility tree** - Ask AI to use `mcp_get_accessibility_tree` to understand page structure
5. **Test iteratively** - Generate small pieces of code and test them before building complex scenarios

## Troubleshooting

**MCP server not connecting:**
- Verify `npm run mcp:start` is running
- Check `mcp.config.json` is valid JSON
- Restart AI tool (Claude, Cursor, VS Code)

**AI generating wrong locators:**
- Ask AI to use `mcp_get_accessibility_tree` first
- Be specific about using `getByRole` in prompt
- Include "semantic locators only" in prompt

**Tests failing with AI-generated code:**
- Verify MCP can access your application (firewall, network)
- Check if page structure changed since AI inspection
- Manually verify locators with Playwright inspector
