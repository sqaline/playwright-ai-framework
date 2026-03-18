import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SmartPageObject - Auto-healing form handling with fallback selectors
 * USE: Legacy apps, unstable selectors, complex forms, reducing flaky tests
 * DON'T USE: Stable apps with data-testid, simple pages, performance-critical tests
 * Default to BasePage; use SmartPageObject only when selector volatility is a problem
 */

/**
 * Field configuration for smart filling with auto-healing
 */
export interface FieldConfig {
    name: string;
    selectors: string[];  // Fallback chain - tries each until one works
    required?: boolean;
    type?: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea';
    dependsOn?: string[];  // For cascading dropdowns - fields this depends on
}

/**
 * SmartPageObject - Enhanced Page Object with auto-healing capabilities
 * Extends BasePage to inherit all existing utilities
 * 
 * Features:
 * - Multi-selector retry (fallback chains)
 * - Auto-detection of disabled/read-only fields
 * - Smart logging and diagnostics
 * - Intelligent dropdown handling
 */
export class SmartPageObject extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    /**
     * Smart fill with auto-healing
     * Tries multiple selector strategies until one works
     * Automatically skips disabled fields
     * Verifies value after filling
     */
    async smartFill(config: FieldConfig, value: string): Promise<void> {
        console.log(`📝 Filling ${config.name}...`);

        for (const selector of config.selectors) {
            try {
                // Check if element exists (use inherited count method)
                const count = await this.count(selector);
                if (count === 0) {
                    console.log(`  ⚠️ "${selector}" not found, trying next...`);
                    continue;
                }

                const element = this.page.locator(selector).first();

                // Check if editable (use inherited isEnabled method)
                const isEnabled = await this.isEnabled(element);
                if (!isEnabled) {
                    console.log(`  ℹ️ ${config.name} is disabled (pre-filled), skipping`);
                    return;
                }

                // Wait for element to be ready
                await element.waitFor({ state: 'visible', timeout: 5000 });

                // Fill using inherited clearAndFill method
                await this.clearAndFill(element, value);
                await this.wait(300); // Small wait for UI update

                // Verify fill succeeded (use inherited getInputValue method)
                const filled = await this.getInputValue(element);
                if (filled === value) {
                    console.log(`  ✅ ${config.name}: "${value}"`);
                    return;
                } else {
                    console.log(`  ⚠️ Verification failed for "${selector}", trying next...`);
                    continue;
                }

            } catch (error: any) {
                const errorMsg = error.message.substring(0, 60);
                console.log(`  ⚠️ "${selector}" failed: ${errorMsg}...`);
                continue;
            }
        }

        // All strategies failed
        if (config.required) {
            throw new Error(`❌ Failed to fill required field: ${config.name}. Tried ${config.selectors.length} selectors.`);
        } else {
            console.log(`  ⏭️ Skipped ${config.name} (all selectors failed)`);
        }
    }

    /**
   * Smart select - handles both native <select> and custom dropdowns
   * Tries multiple selector strategies
   * Auto-detects dropdown type
   * Handles dependent dropdowns (waits for options to populate)
   */
    async smartSelect(config: FieldConfig, value: string, options?: {
        dependsOn?: string[];  // Field names this dropdown depends on
        waitForOptions?: number;  // Wait time for options to load (ms)
    }): Promise<void> {
        console.log(`📋 Selecting ${config.name}: ${value}`);

        // If dependent, wait for options to populate
        if (options?.dependsOn && options.dependsOn.length > 0) {
            console.log(`   ⏳ Waiting for dependent options (depends on: ${options.dependsOn.join(', ')})...`);
            await this.wait(options.waitForOptions || 1000);
        }

        for (const selector of config.selectors) {
            try {
                // Check if element exists
                const count = await this.count(selector);
                if (count === 0) {
                    console.log(`  ⚠️ "${selector}" not found, trying next...`);
                    continue;
                }

                const element = this.page.locator(selector).first();

                // Check if enabled
                const isEnabled = await this.isEnabled(element);
                if (!isEnabled) {
                    console.log(`  ℹ️ ${config.name} is disabled, skipping`);
                    return;
                }

                // Detect dropdown type
                const tagName = await element.evaluate(el => el.tagName);

                if (tagName === 'SELECT') {
                    // Native select - check if options are populated
                    const optionsCount = await element.locator('option').count();

                    if (optionsCount <= 1) {
                        console.log(`  ⏳ Options not loaded yet, waiting...`);
                        await this.wait(1000);
                        const retryCount = await element.locator('option').count();
                        if (retryCount <= 1) {
                            console.log(`  ⚠️ No options available in "${selector}", trying next...`);
                            continue;
                        }
                    }

                    // Try to select by label
                    await this.selectOption(element, { label: value });

                    // Wait for dependent dropdowns to react
                    if (options?.dependsOn) {
                        await this.wait(500);
                    }
                } else {
                    // Custom dropdown - click to open and select
                    await this.click(element);
                    await this.wait(500);

                    // Try to find and click the option
                    const optionLocator = this.page.locator(`text="${value}"`).first();
                    const optionVisible = await optionLocator.isVisible({ timeout: 2000 }).catch(() => false);

                    if (!optionVisible) {
                        console.log(`  ⚠️ Option "${value}" not visible in custom dropdown, trying next...`);
                        // Close dropdown if opened
                        await this.pressKey('Escape');
                        continue;
                    }

                    await this.click(optionLocator);

                    // Wait for dependent dropdowns to react
                    if (options?.dependsOn) {
                        await this.wait(500);
                    }
                }

                console.log(`  ✅ ${config.name}: "${value}"`);
                return;

            } catch (error: any) {
                const errorMsg = error.message.substring(0, 60);
                console.log(`  ⚠️ "${selector}" failed: ${errorMsg}...`);
                continue;
            }
        }

        // All strategies failed
        if (config.required) {
            throw new Error(`Failed to select ${config.name}. Tried ${config.selectors.length} selectors.`);
        } else {
            console.log(`  ⏭️ Skipped ${config.name} (all selectors failed)`);
        }
    }

    /**
     * Smart checkbox/radio - handles selection with auto-healing
     */
    async smartCheck(config: FieldConfig, shouldCheck: boolean = true): Promise<void> {
        console.log(`☑️ ${shouldCheck ? 'Checking' : 'Unchecking'} ${config.name}...`);

        for (const selector of config.selectors) {
            try {
                const count = await this.count(selector);
                if (count === 0) continue;

                const element = this.page.locator(selector).first();
                const isEnabled = await this.isEnabled(element);
                if (!isEnabled) {
                    console.log(`  ℹ️ ${config.name} is disabled, skipping`);
                    return;
                }

                // Use inherited check/uncheck methods
                if (shouldCheck) {
                    await this.check(element);
                } else {
                    await this.uncheck(element);
                }

                console.log(`  ✅ ${config.name} ${shouldCheck ? 'checked' : 'unchecked'}`);
                return;

            } catch (error) {
                continue;
            }
        }

        if (config.required) {
            throw new Error(`Failed to ${shouldCheck ? 'check' : 'uncheck'} ${config.name}`);
        }
    }
}
