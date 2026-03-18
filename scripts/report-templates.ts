import { TestFailure, FileStats, TestSummary } from '../utils/test-results-parser';

/**
 * Report Templates for QA Summary
 * Deterministic report generation when LLM is unavailable
 */

export function formatHeader(): string {
  return [
    '# QA Test Summary',
    '',
    `**Generated**: ${new Date().toISOString()}`,
    `**Framework**: Agentic QA`,
    '',
  ].join('\n');
}

export function formatSummarySection(summary: TestSummary): string {
  const passRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : '0';
  const status = summary.failed > 0 ? '❌ FAILED' : '✅ PASSED';

  return [
    `## Overall Status: ${status}`,
    '',
    '### Statistics',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total Tests | ${summary.total} |`,
    `| Passed | ${summary.passed} (${passRate}%) |`,
    `| Failed | ${summary.failed} |`,
    `| Skipped | ${summary.skipped} |`,
    summary.durationMs ? `| Duration | ${(summary.durationMs / 1000).toFixed(1)}s |` : '',
    '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatByFileSection(byFile: FileStats[]): string {
  if (byFile.length === 0) return '';

  const lines = ['## Results by File', '', '| File | Passed | Failed | Skipped |', '|------|--------|--------|---------|'];

  for (const file of byFile) {
    const statusIcon = file.failed > 0 ? '❌' : '✅';
    lines.push(`| ${statusIcon} \`${file.file}\` | ${file.passed} | ${file.failed} | ${file.skipped} |`);
  }

  lines.push('');
  return lines.join('\n');
}

export function formatFailuresSection(failures: TestFailure[]): string {
  if (failures.length === 0) {
    return ['## Failures', '', 'No failures detected.', ''].join('\n');
  }

  const lines = ['## Failures', '', `Found ${failures.length} failed test(s):`, ''];

  failures.forEach((failure, index) => {
    lines.push(`### ${index + 1}. ${failure.title}`);
    lines.push('');
    lines.push(`- **File**: \`${failure.file}\``);
    if (failure.project) {
      lines.push(`- **Browser**: ${failure.project}`);
    }
    lines.push(`- **Error**:`);
    lines.push('```');
    lines.push(failure.errorMessage.slice(0, 500));
    lines.push('```');
    lines.push('');
  });

  return lines.join('\n');
}

export function formatSuggestedActions(failures: TestFailure[]): string {
  const lines = ['## Suggested Actions', ''];

  if (failures.length === 0) {
    lines.push('- ✅ All tests passed! Consider adding more test coverage.');
    lines.push('');
    return lines.join('\n');
  }

  // Analyze failures for common patterns
  const selectorErrors = failures.filter(
    (f) => /selector|locator|timeout/i.test(f.errorMessage)
  ).length;
  const assertionErrors = failures.filter(
    (f) => /expect|assert|toEqual|toBe/i.test(f.errorMessage)
  ).length;

  if (selectorErrors > 0) {
    lines.push(`- [ ] **Selector issues detected** (${selectorErrors} test(s))`);
    lines.push('  - Update Page Objects with new selectors');
    lines.push('  - Use Playwright Inspector: `npm run test:debug`');
  }

  if (assertionErrors > 0) {
    lines.push(`- [ ] **Assertion failures** (${assertionErrors} test(s))`);
    lines.push('  - Verify expected values are correct');
    lines.push('  - Check if application behavior changed');
  }

  lines.push('- [ ] Review failed test traces in `playwright-report/`');
  lines.push('- [ ] Check test environment stability');
  lines.push('- [ ] Update tests if application changed');

  lines.push('');
  return lines.join('\n');
}
