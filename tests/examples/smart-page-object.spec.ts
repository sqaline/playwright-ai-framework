import { test, expect } from '@playwright/test';
import { SmartExamplePage } from '../../pages/examples/SmartExamplePage';

/**
 * Smart Page Object Pattern Example
 *
 * This test demonstrates:
 * 1. How to use SmartPageObject for auto-healing selectors
 * 2. How to configure fields with fallback strategies
 * 3. How to handle dependent dropdowns
 * 4. How to automatically skip disabled fields
 * 5. How smart filling works with multiple selector attempts
 */
test.describe('Smart Page Object Pattern', () => {
  let smartPage: SmartExamplePage;

  test.beforeEach(async ({ page }) => {
    smartPage = new SmartExamplePage(page);
    await smartPage.goto();
    await smartPage.verifyPageLoaded();
  });

  test('should smart-fill entire form with auto-healing', async ({ page }) => {
    const formData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      country: 'United States',
      city: 'New York',
      terms: true,
      newsletter: true
    };

    // Smart fill will try multiple selectors for each field
    await smartPage.smartFillForm(formData);
    await smartPage.submitForm();

    // Verify form submission
    await expect(page.locator(':has-text("Success")').first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle disabled fields gracefully', async ({ page }) => {
    const formData = {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
      country: 'United States',
      city: 'Boston',
      terms: true
      // Note: phone might be disabled in some scenarios
      // SmartPageObject will automatically skip it
    };

    await smartPage.smartFillForm(formData);
    await smartPage.submitForm();

    // Verify success even if phone field was disabled
    await expect(page.locator(':has-text("Success")').first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle dependent dropdowns correctly', async ({ page }) => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      country: 'Canada',
      city: 'Toronto',
      terms: true
    };

    // Smart fill will:
    // 1. Select country first
    // 2. Wait for city options to populate (dependent dropdown)
    // 3. Then select city
    await smartPage.smartFillForm(formData);

    // Verify city was selected (not empty)
    const citySelect = page.locator('select[name="city"], select[id="city"]').first();
    const selectedCity = await citySelect.inputValue();
    expect(selectedCity).toBe('Toronto');
  });

  test('should handle checkbox selection', async ({ page }) => {
    const formData = {
      name: 'Checkbox Tester',
      email: 'checkbox@example.com',
      country: 'United States',
      city: 'Chicago',
      terms: true,
      newsletter: false // Explicitly uncheck
    };

    await smartPage.smartFillForm(formData);

    // Verify checkboxes
    const termsCheckbox = page.locator('input[name="terms"], input[id="terms"]').first();
    await expect(termsCheckbox).toBeChecked();

    const newsletterCheckbox = page.locator('input[name="newsletter"], input[id="newsletter"]').first();
    await expect(newsletterCheckbox).not.toBeChecked();
  });

  test('should handle partial form fill (optional fields)', async ({ page }) => {
    // Form without optional phone and newsletter fields
    const partialFormData = {
      name: 'Partial User',
      email: 'partial@example.com',
      country: 'United Kingdom',
      city: 'London',
      terms: true
    };

    await smartPage.smartFillForm(partialFormData);
    await smartPage.submitForm();

    await expect(page.locator(':has-text("Success")').first()).toBeVisible({ timeout: 5000 });
  });

  test('should demonstrate field configuration access', async ({ page }) => {
    // Access field configuration for debugging or extension
    const nameConfig = smartPage.getFieldConfig('name');
    expect(nameConfig).toBeDefined();
    expect(nameConfig?.name).toBe('Name');
    expect(nameConfig?.selectors).toHaveLength(4); // Should have 4 fallback selectors

    const termsConfig = smartPage.getFieldConfig('terms');
    expect(termsConfig?.type).toBe('checkbox');
    expect(termsConfig?.required).toBe(true);
  });

  test('should handle multiple selector attempts', async ({ page }) => {
    // This demonstrates auto-healing:
    // If first selector fails, it tries the next one
    const formData = {
      name: 'Auto-Healing Test',
      email: 'healing@example.com',
      country: 'United States',
      city: 'Seattle',
      terms: true
    };

    // Even if selectors change, smartFill will find one that works
    await smartPage.smartFillForm(formData);
    await smartPage.submitForm();

    await expect(page.locator(':has-text("Success")').first()).toBeVisible({ timeout: 5000 });
  });
});

/**
 * Tips for using SmartPageObject:
 *
 * 1. Define field configurations with multiple fallback selectors
 * 2. Use required: true for mandatory fields, false for optional
 * 3. Specify dependencies for cascading dropdowns
 * 4. Let SmartPageObject handle disabled fields automatically
 * 5. Use type field (text, select, checkbox, etc.) for better handling
 * 6. Console output shows which selectors worked and which failed
 * 7. SmartPageObject is perfect for dynamic or evolving UIs
 *
 * Common use cases:
 * - Forms with multiple selector strategies
 * - Applications where selectors frequently change
 * - Complex forms with dependencies
 * - Testing across different UI versions
 * - Reducing flaky tests due to selector issues
 */
