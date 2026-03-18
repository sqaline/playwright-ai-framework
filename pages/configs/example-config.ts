/**
 * Example Field Configuration Template
 *
 * This file demonstrates how to create field configurations
 * for use with SmartPageObject
 *
 * Copy this template and customize for your application's forms
 */

import { FieldConfig } from '../SmartPageObject';

/**
 * Example form field configurations
 *
 * Each field has:
 * - name: Descriptive name for logging
 * - selectors: Array of CSS selectors to try (in order)
 * - required: Whether field is mandatory
 * - type: Field type (text, select, checkbox, etc.)
 * - dependsOn: Array of field names this field depends on (for cascading dropdowns)
 */
export const exampleFormFields: Record<string, FieldConfig> = {
  // Text input fields
  firstName: {
    name: 'First Name',
    selectors: [
      'input[name="firstName"]',
      'input[id="firstName"]',
      'input[placeholder="First Name"]',
      '[data-testid="first-name-input"]',
      '.form-group input[type="text"]:first-child'
    ],
    required: true,
    type: 'text'
  },

  lastName: {
    name: 'Last Name',
    selectors: [
      'input[name="lastName"]',
      'input[id="lastName"]',
      'input[placeholder="Last Name"]',
      '[data-testid="last-name-input"]'
    ],
    required: true,
    type: 'text'
  },

  email: {
    name: 'Email Address',
    selectors: [
      'input[name="email"]',
      'input[type="email"]',
      'input[id="email"]',
      '[data-testid="email-input"]'
    ],
    required: true,
    type: 'text'
  },

  phone: {
    name: 'Phone Number',
    selectors: [
      'input[name="phone"]',
      'input[type="tel"]',
      'input[id="phone"]',
      '[data-testid="phone-input"]'
    ],
    required: false,
    type: 'text'
  },

  // Dropdown fields
  country: {
    name: 'Country',
    selectors: [
      'select[name="country"]',
      'select[id="country"]',
      '[data-testid="country-select"]',
      '.country-dropdown'
    ],
    required: true,
    type: 'select',
    dependsOn: [] // No dependencies
  },

  state: {
    name: 'State/Province',
    selectors: [
      'select[name="state"]',
      'select[id="state"]',
      '[data-testid="state-select"]',
      '.state-dropdown'
    ],
    required: true,
    type: 'select',
    dependsOn: ['country'] // Depends on country selection
  },

  city: {
    name: 'City',
    selectors: [
      'select[name="city"]',
      'select[id="city"]',
      '[data-testid="city-select"]',
      '.city-dropdown'
    ],
    required: true,
    type: 'select',
    dependsOn: ['country', 'state'] // Depends on both country and state
  },

  // Checkboxes
  terms: {
    name: 'Terms and Conditions',
    selectors: [
      'input[name="terms"]',
      'input[id="terms"]',
      '[data-testid="terms-checkbox"]',
      '.terms-checkbox input[type="checkbox"]'
    ],
    required: true,
    type: 'checkbox'
  },

  privacy: {
    name: 'Privacy Policy',
    selectors: [
      'input[name="privacy"]',
      'input[id="privacy"]',
      '[data-testid="privacy-checkbox"]',
      '.privacy-checkbox input[type="checkbox"]'
    ],
    required: true,
    type: 'checkbox'
  },

  newsletter: {
    name: 'Newsletter Subscription',
    selectors: [
      'input[name="newsletter"]',
      'input[id="newsletter"]',
      '[data-testid="newsletter-checkbox"]',
      '.newsletter-checkbox input[type="checkbox"]'
    ],
    required: false,
    type: 'checkbox'
  },

  // Radio buttons
  gender: {
    name: 'Gender',
    selectors: [
      'input[name="gender"]',
      '[data-testid="gender-input"]',
      '.gender-radio input[type="radio"]'
    ],
    required: true,
    type: 'radio'
  },

  // Textarea
  comments: {
    name: 'Additional Comments',
    selectors: [
      'textarea[name="comments"]',
      'textarea[id="comments"]',
      '[data-testid="comments-textarea"]',
      '.comments-section textarea'
    ],
    required: false,
    type: 'textarea'
  }
};

/**
 * Example: Configuration for address form with multiple field types
 */
export const addressFormFields: Record<string, FieldConfig> = {
  addressLine1: {
    name: 'Address Line 1',
    selectors: [
      'input[name="addressLine1"]',
      'input[id="addressLine1"]',
      '[data-testid="address1-input"]'
    ],
    required: true,
    type: 'text'
  },

  addressLine2: {
    name: 'Address Line 2',
    selectors: [
      'input[name="addressLine2"]',
      'input[id="addressLine2"]',
      '[data-testid="address2-input"]'
    ],
    required: false,
    type: 'text'
  },

  zipCode: {
    name: 'ZIP/Postal Code',
    selectors: [
      'input[name="zipCode"]',
      'input[id="zipCode"]',
      '[data-testid="zip-input"]'
    ],
    required: true,
    type: 'text'
  },

  addressType: {
    name: 'Address Type',
    selectors: [
      'select[name="addressType"]',
      'select[id="addressType"]',
      '[data-testid="address-type-select"]'
    ],
    required: true,
    type: 'select',
    dependsOn: []
  },

  isDefault: {
    name: 'Set as Default Address',
    selectors: [
      'input[name="isDefault"]',
      'input[id="isDefault"]',
      '[data-testid="default-address-checkbox"]'
    ],
    required: false,
    type: 'checkbox'
  }
};

/**
 * Tips for creating field configurations:
 *
 * 1. **Order selectors by likelihood**: Put most likely selectors first
 * 2. **Use multiple strategies**: Mix name, id, placeholder, data-testid, etc.
 * 3. **Consider CSS vs XPath**: CSS is preferred, but XPath can be useful
 * 4. **Use data-testid**: Most reliable for testing (doesn't change with styling)
 * 5. **Mark optional fields**: Set required: false for fields that can be skipped
 * 6. **Handle dependencies**: For cascading dropdowns, specify dependsOn array
 * 7. **Be specific**: Use more specific selectors to avoid matching wrong elements
 * 8. **Test your selectors**: Verify each selector works before adding to the list
 *
 * Common selector strategies:
 * - By name: input[name="fieldName"]
 * - By id: input[id="fieldId"]
 * - By placeholder: input[placeholder="Placeholder Text"]
 * - By data attribute: [data-testid="test-id"]
 * - By CSS class: .class-name input[type="text"]
 * - By combination: .form-group input[name="email"]
 *
 * For dynamic elements:
 * - Use data-testid attributes (recommended)
 * - Use more specific CSS selectors
 * - Add multiple fallback selectors
 * - Consider parent-child relationships
 */
