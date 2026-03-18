import { Page, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { VisualRegressionResult } from './types';

/**
 * Visual Regression Testing Utility
 * Compares screenshots to detect UI changes
 *
 * Usage Example:
 * ```typescript
 * const comparator = new VisualComparator(page, 'screenshots/baseline');
 * await comparator.compare(page, 'dashboard', 'screenshots/current.png');
 * expect(result.hasDifference).toBe(false);
 * ```
 */
export class VisualComparator {
  private readonly baselineDir: string;
  private readonly currentDir: string;
  private readonly threshold: number;

  constructor(baselineDir: string, currentDir: string, threshold: number = 0.01) {
    this.baselineDir = baselineDir;
    this.currentDir = currentDir;
    this.threshold = threshold; // 1% difference threshold
  }

  /**
   * Take screenshot for comparison
   */
  async takeScreenshot(page: Page, testName: string): Promise<Buffer> {
    const screenshotPath = path.join(this.currentDir, `${testName}.png`);

    // Take full page screenshot
    const screenshot = await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshot;
  }

  /**
   * Compare two screenshots pixel by pixel
   */
  private compareScreenshots(baseline: Buffer, current: Buffer): { percentage: number; pixelCount: number } {
    if (baseline.length !== current.length) {
      console.warn('⚠️  Screenshot sizes do not match');
      return { percentage: 100, pixelCount: 0 }; // Max difference
    }

    let differences = 0;
    const totalPixels = baseline.length / 4; // RGBA

    for (let i = 0; i < totalPixels; i += 4) {
      const baselineR = baseline[i];
      const baselineG = baseline[i + 1];
      const baselineB = baseline[i + 2];
      const baselineA = baseline[i + 3];

      const currentR = current[i];
      const currentG = current[i + 1];
      const currentB = current[i + 2];
      const currentA = current[i + 3];

      // Calculate average color difference
      const diffR = Math.abs(currentR - baselineR);
      const diffG = Math.abs(currentG - baselineG);
      const diffB = Math.abs(currentB - baselineB);
      const diffA = Math.abs(currentA - baselineA);

      const avgDiff = (diffR + diffG + diffB + diffA) / 4;

      if (avgDiff > this.threshold * 255) { // Convert to 0-255 scale
        differences++;
      }
    }

    const differencePercentage = (differences / totalPixels) * 100;

    console.log(`📊 Pixel differences: ${differences} (${differencePercentage.toFixed(2)}%)`);
    return { percentage: differencePercentage, pixelCount: differences };
  }

  /**
   * Compare current screenshot with baseline
   */
  async compare(
    page: Page,
    testName: string
  ): Promise<VisualRegressionResult> {
    const baselinePath = path.join(this.baselineDir, `${testName}.png`);
    const currentPath = path.join(this.currentDir, `${testName}.png`);

    // Check if baseline exists
    if (!fs.existsSync(baselinePath)) {
      console.log(`⚠️  No baseline found for: ${testName}`);
      console.log(`   Creating baseline from current screenshot`);

      // Create baseline from current
      const current = await this.takeScreenshot(page, testName);
      if (fs.existsSync(path.dirname(baselinePath))) {
        fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
      }
      fs.copyFileSync(current, baselinePath);

      return {
        testName,
        baselinePath,
        currentPath,
        hasDifference: false,
        differencePercentage: 0,
      };
    }

    // Take current screenshot for comparison
    const current = await this.takeScreenshot(page, testName);

    // Load baseline
    const baseline = fs.readFileSync(baselinePath);

    // Compare pixel by pixel
    const { percentage: differencePercentage, pixelCount } = this.compareScreenshots(baseline, current);

    const hasDifference = differencePercentage > this.threshold;

    if (hasDifference) {
      console.log(`\n🔴 Visual regression detected!`);
      console.log(`   Baseline: ${baselinePath}`);
      console.log(`   Current: ${currentPath}`);
      console.log(`   Difference: ${differencePercentage.toFixed(2)}%`);
      console.log(`   Threshold: ${this.threshold * 100}%`);
    } else {
      console.log(`\n✅ No visual regression detected`);
    }

    return {
      testName,
      baselinePath,
      currentPath,
      hasDifference,
      differencePercentage,
      pixelDifference: pixelCount,
    };
  }

  /**
   * Update baseline (use when UI changes intentionally)
   */
  updateBaseline(testName: string): void {
    const currentPath = path.join(this.currentDir, `${testName}.png`);
    const baselinePath = path.join(this.baselineDir, `${testName}.png`);

    if (!fs.existsSync(currentPath)) {
      throw new Error(`No current screenshot found at: ${currentPath}`);
    }

    // Ensure baseline directory exists
    if (!fs.existsSync(this.baselineDir)) {
      fs.mkdirSync(this.baselineDir, { recursive: true });
    }

    // Move current to baseline
    fs.copyFileSync(currentPath, baselinePath);
    console.log(`✅ Baseline updated for: ${testName}`);
  }

  /**
   * Generate visual regression report
   */
  generateReport(results: VisualRegressionResult[]): string {
    console.log('\n📊 Visual Regression Report');

    const totalTests = results.length;
    const regressions = results.filter(r => r.hasDifference).length;
    const regressionRate = (regressions / totalTests) * 100;

    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Regressions: ${regressions}`);
    console.log(`   Regression rate: ${regressionRate.toFixed(2)}%`);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        regressions,
        regressionRate,
      },
      details: results,
    };

    // Save report
    const reportPath = 'reports/visual-regression.json';
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}`);

    return JSON.stringify(report, null, 2);
  }
}

/**
 * Visual regression testing example
 *
 * Usage in tests:
 * ```typescript
 * import { test } from '@playwright/test';
 * import { VisualComparator } from '../utils/visual-comparator';
 *
 * test('should not have visual regression', async ({ page }) => {
 *   const comparator = new VisualComparator(
 *     page,
 *     'screenshots/baseline',
 *     'screenshots/current',
 *     0.01 // 1% threshold
 *   );
 *
 *   await page.goto('/dashboard');
 *   await comparator.compare(page, 'dashboard');
 * });
 * ```
 */
