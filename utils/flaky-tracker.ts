import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface FlakyTestInfo {
  testName: string;
  failureCount: number;
  lastFailureDate: string;
  lastFailureMessage: string;
}

interface FlakyReport {
  timestamp: string;
  flakyTests: FlakyTestInfo[];
  totalTests: number;
  flakyTestCount: number;
  flakyTestRate: number;
}

/**
 * Simple Flaky Test Tracker
 *
 * Uses Playwright's built-in retries and trace recording
 * No complex orchestration - just tracking what already exists
 */
export class FlakyTestTracker {
  private flakyTests: Map<string, FlakyTestInfo> = new Map();
  private failureHistory: Map<string, string[]> = new Map();
  private reportPath: string;

  constructor(reportPath: string = 'reports/flaky-report.json') {
    this.reportPath = reportPath;
    this.loadHistory();
  }

  /**
   * Load previous failure history from report file
   */
  private loadHistory(): void {
    try {
      if (fs.existsSync(this.reportPath)) {
        const data = fs.readFileSync(this.reportPath, 'utf-8');
        const report = JSON.parse(data);

        if (report.flakyTests) {
          report.flakyTests.forEach((test: FlakyTestInfo) => {
            this.flakyTests.set(test.testName, test);
            const history = this.failureHistory.get(test.testName) || [];
            history.push(test.lastFailureDate || new Date().toISOString());
            this.failureHistory.set(test.testName, history);
          });
        }
      }
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
    }
  }

  /**
   * Track test execution
   */
  trackTestExecution(testInfo: any): void {
    const testName = `${testInfo.titlePath.join(' ')}`;
    const currentCount = this.flakyTests.get(testName)?.failureCount || 0;

    this.flakyTests.set(testName, {
      testName,
      failureCount: currentCount,
      lastFailureDate: new Date().toISOString(),
      lastFailureMessage: testInfo.error?.message || 'Unknown error'
    });
  }

  /**
   * Record test failure
   */
  recordFailure(testInfo: any): void {
    const testName = `${testInfo.titlePath.join(' ')}`;
    const currentInfo = this.flakyTests.get(testName) || {
      testName,
      failureCount: 0,
      lastFailureDate: new Date().toISOString(),
      lastFailureMessage: ''
    };

    // Update failure count and details
    currentInfo.failureCount += 1;
    currentInfo.lastFailureDate = new Date().toISOString();
    currentInfo.lastFailureMessage = testInfo.error?.message || 'Unknown error';

    this.flakyTests.set(testName, currentInfo);

    // Track failure history
    const history = this.failureHistory.get(testName) || [];
    history.push(new Date().toISOString());
    this.failureHistory.set(testName, history);
  }

  /**
   * Record test success
   */
  recordSuccess(testInfo: any): void {
    const testName = `${testInfo.titlePath.join(' ')}`;
    const currentInfo = this.flakyTests.get(testName);

    if (currentInfo && currentInfo.failureCount > 0) {
      // Test recovered from previous failures
      currentInfo.failureCount = 0; // Reset on success
    } else if (currentInfo) {
      currentInfo.failureCount = 0;
      currentInfo.lastFailureDate = '';
      currentInfo.lastFailureMessage = '';
    }

    if (currentInfo) {
      this.flakyTests.set(testName, currentInfo);
    }
  }

  /**
   * Get flakiness score for a test
   * Score > 50% = Flaky, needs attention
   * Score > 30% = Very Flaky, critical
   */
  getFlakinessScore(testName: string): number {
    const testInfo = this.flakyTests.get(testName);
    if (!testInfo || testInfo.failureCount === 0) {
      return 0; // No failures
    }

    // Simple calculation: (failures / total_runs) * 100
    // Default to total_runs = failureCount + (failureCount * 4) if not tracked
    const estimatedRuns = testInfo.failureCount + (testInfo.failureCount * 4);
    return (testInfo.failureCount / estimatedRuns) * 100;
  }

  /**
   * Get all flaky tests
   */
  getFlakyTests(threshold: number = 50): FlakyTestInfo[] {
    const flakyTests: FlakyTestInfo[] = [];

    this.flakyTests.forEach((testInfo) => {
      const score = this.getFlakinessScore(testInfo.testName);
      if (score >= threshold) {
        flakyTests.push(testInfo);
      }
    });

    // Sort by flakiness score (highest first)
    return flakyTests.sort((a, b) => {
      const scoreA = this.getFlakinessScore(a.testName);
      const scoreB = this.getFlakinessScore(b.testName);
      return scoreB - scoreA;
    });
  }

  /**
   * Generate flaky test report
   */
  generateReport(): FlakyReport {
    const totalTests = this.flakyTests.size;
    const flakyTests = this.getFlakyTests(30); // 30% threshold
    const flakyTestRate = totalTests > 0 ? (flakyTests.length / totalTests) * 100 : 0;

    const report: FlakyReport = {
      timestamp: new Date().toISOString(),
      flakyTests: flakyTests,
      totalTests,
      flakyTestCount: flakyTests.length,
      flakyTestRate: parseFloat(flakyTestRate.toFixed(2))
    };

    // Save report
    const reportDir = path.dirname(this.reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  /**
   * Print flaky test summary
   */
  printSummary(): void {
    const flakyTests = this.getFlakyTests(30);

    console.log('\n📊 Flaky Test Report');
    console.log('='.repeat(50));

    if (flakyTests.length === 0) {
      console.log('✅ No flaky tests detected!');
      console.log('   Great job keeping tests stable.');
      return;
    }

    console.log(`⚠️  Found ${flakyTests.length} flaky test(s)`);
    console.log(`   Flaky rate: ${((flakyTests.length / this.flakyTests.size) * 100).toFixed(1)}%`);

    flakyTests.forEach((test, index) => {
      const score = this.getFlakinessScore(test.testName);
      console.log(`\n${index + 1}. ${test.testName}`);
      console.log(`   Flakiness Score: ${score.toFixed(1)}%`);
      console.log(`   Failures: ${test.failureCount}`);
      console.log(`   Last Failure: ${test.lastFailureMessage}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('💡 Recommendations:');

    if (flakyTests.length > 0) {
      console.log('   1. Review test timing - use explicit waits');
      console.log('   2. Check for race conditions');
      console.log('   3. Add more specific selectors');
      console.log('   4. Consider test data dependencies');
    }
  }
}

/**
 * Global tracker instance for use in tests
 */
export const flakyTracker = new FlakyTestTracker();
