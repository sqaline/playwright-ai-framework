import { Page } from '@playwright/test';
import { SmartPageObject } from '../SmartPageObject';
import { FieldConfig } from '../SmartPageObject';

/**
 * SmartExamplePage - Demonstrates SmartPageObject with auto-healing
 * Extends SmartPageObject for intelligent field handling
 *
 * This example shows how to use smart filling with fallback selectors
 * Perfect for forms where selectors might change or have multiple representations
 */
export class SmartExamplePage extends SmartPageObject {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Example field configurations with fallback selectors
   * Each field has multiple selector strategies to try
   */
  private readonly formFields: Record<string, FieldConfig> = {
    name: {
      name: 'Name',
      selectors: [
        'input[name="name"]',
        'input[id="name"]',
        'input[placeholder="Full Name"]',
        '[data-testid="name-input"]'
      ],
      required: true,
      type: 'text'
    },
    email: {
      name: 'Email',
      selectors: [
        'input[name="email"]',
        'input[id="email"]',
        'input[type="email"]',
        '[data-testid="email-input"]'
      ],
      required: true,
      type: 'text'
    },
    phone: {
      name: 'Phone',
      selectors: [
        'input[name="phone"]',
        'input[id="phone"]',
        'input[type="tel"]',
        '[data-testid="phone-input"]'
      ],
      required: false,
      type: 'text'
    },
    country: {
      name: 'Country',
      selectors: [
        'select[name="country"]',
        'select[id="country"]',
        '[data-testid="country-select"]'
      ],
      required: true,
      type: 'select',
      dependsOn: []
    },
    city: {
      name: 'City',
      selectors: [
        'select[name="city"]',
        'select[id="city"]',
        '[data-testid="city-select"]'
      ],
      required: true,
      type: 'select',
      dependsOn: ['country'] // Depends on country selection
    },
    terms: {
      name: 'Terms and Conditions',
      selectors: [
        'input[name="terms"]',
        'input[id="terms"]',
        '[data-testid="terms-checkbox"]'
      ],
      required: true,
      type: 'checkbox'
    },
    newsletter: {
      name: 'Newsletter Subscription',
      selectors: [
        'input[name="newsletter"]',
        'input[id="newsletter"]',
        '[data-testid="newsletter-checkbox"]'
      ],
      required: false,
      type: 'checkbox'
    }
  };

  /**
   * Smart fill entire form with auto-healing
   * Each field tries multiple selector strategies
   * Disabled/read-only fields are automatically skipped
   */
  async smartFillForm(formData: {
    name: string;
    email: string;
    phone?: string;
    country: string;
    city: string;
    terms: boolean;
    newsletter?: boolean;
  }): Promise<void> {
    console.log('📋 Smart filling form...');

    // Fill text fields
    await this.smartFill(this.formFields.name, formData.name);
    await this.smartFill(this.formFields.email, formData.email);

    // Optional fields (phone and newsletter)
    if (formData.phone) {
      await this.smartFill(this.formFields.phone, formData.phone);
    }

    // Select dropdowns with dependency handling
    await this.smartSelect(this.formFields.country, formData.country, {
      waitForOptions: 500
    });

    await this.smartSelect(this.formFields.city, formData.city, {
      dependsOn: ['country'],
      waitForOptions: 1500 // Wait longer for dependent options
    });

    // Handle checkboxes
    await this.smartCheck(this.formFields.terms, formData.terms);

    if (formData.newsletter !== undefined) {
      await this.smartCheck(this.formFields.newsletter, formData.newsletter);
    }

    console.log('✅ Form smart-filled successfully!');
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    const submitButton = this.page.locator(
      'button[type="submit"], button:has-text("Submit"), input[type="submit"]'
    ).first();
    await this.click(submitButton);
    await this.waitForPageLoad();
  }

  /**
   * Get field configuration (useful for debugging or extending)
   */
  getFieldConfig(fieldName: string): FieldConfig | undefined {
    return this.formFields[fieldName];
  }

  /**
   * Navigate to example page
   */
  async goto(): Promise<void> {
    await super.goto('/smart-example');
  }

  /**
   * Verify page loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await this.expectVisible('form');
  }
}
