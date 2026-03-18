import { test, expect } from '@playwright/test';
import { BasePage } from '../../pages/BasePage';

/**
 * Role-Based Fixture Pattern Example
 *
 * This test demonstrates how to create role-based fixtures
 * for different user types (e.g., admin, user, guest)
 *
 * Fixtures provide:
 * 1. Pre-authenticated page instances
 * 2. Role-specific configurations
 * 3. Reusable setup/teardown logic
 * 4. Clean test organization
 */

// Define test data types
type RoleType = 'admin' | 'user' | 'guest';

interface RoleCredentials {
  email: string;
  password: string;
}

/**
 * Base fixture type with role information
 */
interface RoleFixture {
  role: RoleType;
  credentials: RoleCredentials;
  page: import('@playwright/test').Page;
}

/**
 * Create base test extension for role-based testing
 */
const base = test.extend<RoleFixture>({});

/**
 * Admin role fixture - Pre-authenticated admin user
 */
export const testAsAdmin = base.extend<RoleFixture>({
  role: 'admin',
  credentials: async ({}, use: (value: RoleCredentials) => Promise<void>) => {
    const credentials: RoleCredentials = {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
    };
    await use(credentials);
  },
  page: async ({ role, credentials, page }, use: (value: import('@playwright/test').Page) => Promise<void>) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', credentials.email);
    await page.fill('input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Use authenticated page
    await use(page);

    // Cleanup - logout after test
    await page.goto('/logout');
  }
});

/**
 * Regular user role fixture - Pre-authenticated regular user
 */
export const testAsUser = base.extend<RoleFixture>({
  role: 'user',
  credentials: async ({}, use: (value: RoleCredentials) => Promise<void>) => {
    const credentials: RoleCredentials = {
      email: process.env.TEST_USER_EMAIL || 'user@example.com',
      password: process.env.TEST_USER_PASSWORD || 'user123'
    };
    await use(credentials);
  },
  page: async ({ role, credentials, page }, use: (value: import('@playwright/test').Page) => Promise<void>) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('input[name="email"]', credentials.email);
    await page.fill('input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Use authenticated page
    await use(page);

    // Cleanup - logout after test
    await page.goto('/logout');
  }
});

/**
 * Guest role fixture - No authentication required
 */
export const testAsGuest = base.extend<RoleFixture>({
  role: 'guest',
  credentials: async ({}, use: (value: RoleCredentials) => Promise<void>) => {
    const credentials: RoleCredentials = {
      email: '',
      password: ''
    };
    await use(credentials);
  },
  page: async ({ page }, use: (value: import('@playwright/test').Page) => Promise<void>) => {
    // No login needed
    await page.goto('/');

    // Use unauthenticated page
    await use(page);
  }
});

// Admin-only tests
testAsAdmin.describe('Admin Dashboard', () => {
  testAsAdmin('can access admin settings', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.locator('h1')).toContainText('Admin Settings');
  });

  testAsAdmin('can manage users', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('table')).toBeVisible();
  });

  testAsAdmin('can view system logs', async ({ page }) => {
    await page.goto('/admin/logs');
    await expect(page.locator('.log-entry').first()).toBeVisible();
  });
});

// User tests
testAsUser.describe('User Dashboard', () => {
  testAsUser('can access user profile', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText('Profile');
  });

  testAsUser('can update account settings', async ({ page }) => {
    await page.goto('/settings');
    await page.fill('input[name="email"]', 'updated@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });
});

// Guest tests (no authentication)
testAsGuest.describe('Public Pages', () => {
  testAsGuest('can access home page', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  testAsGuest('can access about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('About');
  });
});

/**
 * Using fixtures in regular tests
 */
test.describe('Combined Role Tests', () => {
  test('admin can see content that user cannot', async ({ page }) => {
    // Login as user first
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'user@example.com');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'user123');
    await page.click('button[type="submit"]');

    // Try to access admin page (should fail)
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/.*(login|forbidden)/);

    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
    await page.click('button[type="submit"]');

    // Try to access admin page (should succeed)
    await page.goto('/admin/settings');
    await expect(page.locator('h1')).toContainText('Admin Settings');
  });
});

/**
 * Tips for creating role-based fixtures:
 *
 * 1. Define role types at the top for type safety
 * 2. Use environment variables for credentials
 * 3. Each fixture handles its own login/logout
 * 4. Fixtures are reusable across multiple tests
 * 5. Keep fixture logic simple and focused
 * 6. Use descriptive fixture names (testAsAdmin, testAsUser, etc.)
 * 7. Remember to cleanup after each test (logout, etc.)
 */
