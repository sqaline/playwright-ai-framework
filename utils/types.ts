/**
 * Shared type definitions for the framework
 */

export interface APIResponse<T = any> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

export interface FlakyTestInfo {
  testName: string;
  failureCount: number;
  lastFailureDate: string;
  lastFailureMessage: string;
}

export interface FlakyReport {
  timestamp: string;
  flakyTests: FlakyTestInfo[];
  totalTests: number;
  flakyTestCount: number;
  flakyTestRate: number;
}

export interface TestCase {
  title: string;
  description?: string;
  tags?: string[];
}

export interface TestResult {
  test: TestCase;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: string;
  retries?: number;
}

export interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  flakyTests: number;
  averageDuration: number;
  slowTests: number;
}

export interface PerformanceMetrics {
  actionName: string;
  duration: number;
  timestamp: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface VisualRegressionResult {
  testName: string;
  baselinePath: string;
  currentPath: string;
  hasDifference: boolean;
  differencePercentage: number;
  pixelDifference?: number;
}

export interface MCPConfig {
  openai?: {
    apiKey: string;
    model?: string;
  };
  testRunner?: {
    enabled: boolean;
  };
}
