import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ParsedTestResults } from './test-results-parser';

/**
 * LLM-Powered Test Results Summarizer
 * Uses OpenAI to generate intelligent QA summaries
 */

export interface SummarizeOptions {
  runId?: string;
  branch?: string;
  commit?: string;
  specContext?: string;
}

/**
 * Build prompt for LLM analysis
 */
function buildPrompt(
  parsed: ParsedTestResults,
  options: SummarizeOptions = {}
): ChatCompletionMessageParam[] {
  const { summary, byFile, failures } = parsed;
  const specSnippet = options.specContext
    ? `\n\nSpec/context excerpt:\n${options.specContext.slice(0, 4000)}`
    : '';

  const userContent = [
    `Test run metadata:`,
    options.runId ? `- runId: ${options.runId}` : '',
    options.branch ? `- branch: ${options.branch}` : '',
    options.commit ? `- commit: ${options.commit}` : '',
    '',
    'Summary:',
    `- total: ${summary.total}`,
    `- passed: ${summary.passed}`,
    `- failed: ${summary.failed}`,
    `- skipped: ${summary.skipped}`,
    summary.durationMs ? `- durationMs: ${summary.durationMs}` : '',
    '',
    'By file:',
    ...byFile.map(
      (entry) =>
        `- ${entry.file}: passed=${entry.passed}, failed=${entry.failed}, skipped=${entry.skipped}`
    ),
    '',
    'Failures:',
    failures.length
      ? failures
          .map(
            (failure, idx) =>
              `${idx + 1}. title="${failure.title}", file="${failure.file}", error="${failure.errorMessage.slice(0, 300)}", project="${failure.project ?? 'n/a'}"`
          )
          .join('\n')
      : 'None',
    specSnippet,
    '',
    'Instructions:',
    '- You are a senior QA lead. Summarize test results for engineering + product.',
    '- Do NOT invent tests or failures; use only provided data.',
    '- Provide a concise Markdown report with:',
    '  - Overall status and stats',
    '  - Top issues (3-5) with probable causes',
    '  - Suggested next actions as checklist',
    '  - Notes if data is missing or inconclusive',
    '- Keep it factual and actionable.',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    {
      role: 'system',
      content:
        'You are a senior QA lead. You summarize test results for engineering and product. Be concise, factual, and actionable. Never fabricate failures. If data is missing, say so.',
    },
    {
      role: 'user',
      content: userContent,
    },
  ];
}

/**
 * Build fallback report when LLM is unavailable
 */
function buildFallbackReport(parsed: ParsedTestResults, options: SummarizeOptions = {}): string {
  const { summary, byFile, failures } = parsed;
  const passRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : '0';
  const status = summary.failed > 0 ? '❌ FAILED' : '✅ PASSED';

  const lines: string[] = [
    '# QA Test Summary',
    '',
    `**Generated**: ${new Date().toISOString()}`,
    `**Status**: ${status}`,
    '',
    '## Statistics',
    '',
    `- **Total Tests**: ${summary.total}`,
    `- **Passed**: ${summary.passed} (${passRate}%)`,
    `- **Failed**: ${summary.failed}`,
    `- **Skipped**: ${summary.skipped}`,
    '',
  ];

  if (byFile.length > 0) {
    lines.push('## Results by File', '');
    for (const file of byFile) {
      const fileStatus = file.failed > 0 ? '❌' : '✅';
      lines.push(`- ${fileStatus} \`${file.file}\`: ${file.passed} passed, ${file.failed} failed`);
    }
    lines.push('');
  }

  if (failures.length > 0) {
    lines.push('## Failed Tests', '');
    failures.forEach((failure, idx) => {
      lines.push(`### ${idx + 1}. ${failure.title}`);
      lines.push(`- **File**: \`${failure.file}\``);
      lines.push(`- **Error**: ${failure.errorMessage.slice(0, 300)}`);
      lines.push('');
    });

    lines.push('## Suggested Actions', '');
    lines.push('- [ ] Review failed test error messages');
    lines.push('- [ ] Check for selector changes in UI');
    lines.push('- [ ] Verify test environment is stable');
    lines.push('- [ ] Run healer agent if selector issues detected');
    lines.push('');
  }

  if (options.branch || options.runId || options.commit) {
    lines.push('## Run Metadata', '');
    if (options.branch) lines.push(`- **Branch**: ${options.branch}`);
    if (options.runId) lines.push(`- **Run ID**: ${options.runId}`);
    if (options.commit) lines.push(`- **Commit**: ${options.commit}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('*Report generated without AI analysis (OPENAI_API_KEY not configured)*');

  return lines.join('\n');
}

/**
 * Summarize test results using LLM
 */
export async function summarizeTestResults(
  parsed: ParsedTestResults,
  options: SummarizeOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    console.log('OPENAI_API_KEY not set, using fallback report generation');
    return buildFallbackReport(parsed, options);
  }

  const client = new OpenAI({ apiKey });
  const messages = buildPrompt(parsed, options);

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (content) {
      return content;
    }

    return buildFallbackReport(parsed, options);
  } catch (error) {
    const reason = (error as Error).message;
    console.warn(`LLM summary failed (${reason}). Falling back to static report.`);
    return buildFallbackReport(parsed, options);
  }
}
