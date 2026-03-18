import fs from 'fs';

/**
 * Playwright JSON Report Parser
 * Parses test results for AI-powered analysis
 */

export interface TestFailure {
  title: string;
  file: string;
  errorMessage: string;
  project?: string;
  duration?: number;
}

export interface FileStats {
  file: string;
  passed: number;
  failed: number;
  skipped: number;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs?: number;
}

export interface ParsedTestResults {
  summary: TestSummary;
  byFile: FileStats[];
  failures: TestFailure[];
}

interface PlaywrightSpec {
  title: string;
  file?: string;
  tests?: PlaywrightTest[];
  specs?: PlaywrightSpec[];
}

interface PlaywrightTest {
  title: string;
  status: 'expected' | 'unexpected' | 'skipped' | 'flaky';
  projectName?: string;
  duration?: number;
  results?: Array<{
    status: string;
    duration: number;
    error?: {
      message?: string;
      stack?: string;
    };
  }>;
}

interface PlaywrightSuite {
  title: string;
  file?: string;
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

interface PlaywrightJsonReport {
  config?: {
    rootDir?: string;
  };
  suites?: PlaywrightSuite[];
}

function extractTests(
  suite: PlaywrightSuite | PlaywrightSpec,
  filePath: string,
  results: { failures: TestFailure[]; byFile: Map<string, FileStats> }
): void {
  const currentFile = suite.file || filePath;

  // Initialize file stats if not exists
  if (!results.byFile.has(currentFile)) {
    results.byFile.set(currentFile, {
      file: currentFile,
      passed: 0,
      failed: 0,
      skipped: 0,
    });
  }

  const fileStats = results.byFile.get(currentFile)!;

  // Process tests in specs
  if ('specs' in suite && suite.specs) {
    for (const spec of suite.specs) {
      if ('tests' in spec && spec.tests) {
        for (const test of spec.tests) {
          const testFile = spec.file || currentFile;

          // Update file stats for this test
          if (!results.byFile.has(testFile)) {
            results.byFile.set(testFile, {
              file: testFile,
              passed: 0,
              failed: 0,
              skipped: 0,
            });
          }
          const testFileStats = results.byFile.get(testFile)!;

          if (test.status === 'expected') {
            testFileStats.passed++;
          } else if (test.status === 'unexpected') {
            testFileStats.failed++;
            const errorMessage =
              test.results?.[0]?.error?.message ||
              test.results?.[0]?.error?.stack ||
              'Unknown error';
            results.failures.push({
              title: `${spec.title} > ${test.title}`,
              file: testFile,
              errorMessage,
              project: test.projectName,
              duration: test.duration,
            });
          } else if (test.status === 'skipped') {
            testFileStats.skipped++;
          }
        }
      }
      // Recursively process nested specs
      extractTests(spec, currentFile, results);
    }
  }

  // Process nested suites
  if ('suites' in suite && suite.suites) {
    for (const nestedSuite of suite.suites) {
      extractTests(nestedSuite, currentFile, results);
    }
  }
}

/**
 * Parse Playwright JSON report file
 */
export function parsePlaywrightJsonReport(reportPath: string): ParsedTestResults {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report file not found: ${reportPath}`);
  }

  const raw = fs.readFileSync(reportPath, 'utf-8');
  const report: PlaywrightJsonReport = JSON.parse(raw);

  const results = {
    failures: [] as TestFailure[],
    byFile: new Map<string, FileStats>(),
  };

  // Process all suites
  if (report.suites) {
    for (const suite of report.suites) {
      extractTests(suite, suite.file || 'unknown', results);
    }
  }

  // Calculate summary
  const byFile = Array.from(results.byFile.values());
  const summary: TestSummary = {
    total: byFile.reduce((acc, f) => acc + f.passed + f.failed + f.skipped, 0),
    passed: byFile.reduce((acc, f) => acc + f.passed, 0),
    failed: byFile.reduce((acc, f) => acc + f.failed, 0),
    skipped: byFile.reduce((acc, f) => acc + f.skipped, 0),
  };

  return {
    summary,
    byFile,
    failures: results.failures,
  };
}

/**
 * Generate markdown summary from parsed results
 */
export function generateMarkdownSummary(results: ParsedTestResults): string {
  const { summary, byFile, failures } = results;

  const lines: string[] = [
    '# Test Results Summary',
    '',
    `**Generated**: ${new Date().toISOString()}`,
    '',
    '## Statistics',
    '',
    `- **Total Tests**: ${summary.total}`,
    `- **Passed**: ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)`,
    `- **Failed**: ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)`,
    `- **Skipped**: ${summary.skipped}`,
    '',
  ];

  if (byFile.length > 0) {
    lines.push('## Results by File', '');
    lines.push('| File | Passed | Failed | Skipped |');
    lines.push('|------|--------|--------|---------|');
    for (const file of byFile) {
      lines.push(`| ${file.file} | ${file.passed} | ${file.failed} | ${file.skipped} |`);
    }
    lines.push('');
  }

  if (failures.length > 0) {
    lines.push('## Failed Tests', '');
    failures.forEach((failure, index) => {
      lines.push(`### ${index + 1}. ${failure.title}`);
      lines.push(`- **File**: \`${failure.file}\``);
      if (failure.project) {
        lines.push(`- **Project**: ${failure.project}`);
      }
      lines.push(`- **Error**: ${failure.errorMessage.slice(0, 500)}`);
      lines.push('');
    });
  }

  return lines.join('\n');
}
