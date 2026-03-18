import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { parsePlaywrightJsonReport } from '../utils/test-results-parser';
import { summarizeTestResults } from '../utils/llm-summarizer';

dotenv.config();

/**
 * Generate AI-Powered QA Report
 * Reads test results and generates an intelligent summary
 */

function safeReadSnippet(filePath: string, maxChars = 2000): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.slice(0, maxChars);
  } catch {
    return undefined;
  }
}

async function main(): Promise<void> {
  console.log('🤖 Generating QA Report...\n');

  const reportPath = path.resolve('reports/test-results.json');

  let parsed;
  try {
    parsed = parsePlaywrightJsonReport(reportPath);
  } catch (error) {
    console.error(
      (error as Error).message ||
        'No Playwright JSON report found. Run tests with JSON reporter enabled first.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(`📊 Found ${parsed.summary.total} tests`);
  console.log(`   ✅ Passed: ${parsed.summary.passed}`);
  console.log(`   ❌ Failed: ${parsed.summary.failed}`);
  console.log(`   ⏭️  Skipped: ${parsed.summary.skipped}\n`);

  console.log('📝 Generating summary...');
  const markdown = await summarizeTestResults(parsed, {
    specContext: '',
    branch: process.env.GITHUB_REF,
    commit: process.env.GITHUB_SHA,
    runId: process.env.GITHUB_RUN_ID,
  });

  // Ensure reports directory exists
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Write report
  const outputPath = path.join(reportsDir, 'qa-summary.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');

  const statusEmoji =
    parsed.summary.failed > 0
      ? '❌ Failed'
      : parsed.summary.skipped > 0
        ? '⚠️ Passed with skips'
        : '✅ All green';

  console.log(`\n${statusEmoji}`);
  console.log(`📄 QA summary written to ${outputPath}`);
}

main().catch((error) => {
  console.error('Unexpected error while generating QA summary:', error);
  process.exitCode = 1;
});
