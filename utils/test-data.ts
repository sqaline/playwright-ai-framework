/**
 * Test Data Utilities for Playwright Automation Framework
 * Generates test data with configurable prefix and domain
 */

let applicationCounter = 1;
let borrowerCounter = 1;
let transactionCounter = 1;

/**
 * Generate unique application ID with QA prefix
 */
export function generateApplicationId(): string {
  const timestamp = Date.now();
  const id = `QA_APP_${timestamp}_${String(applicationCounter).padStart(3, '0')}`;
  applicationCounter++;
  return id;
}

/**
 * Generate unique phone number for testing
 */
export function generatePhoneNumber(): string {
  const random = Math.floor(1000000 + Math.random() * 9000000);
  return `+1555${random}`;
}

/**
 * Generate unique email with configurable prefix and domain
 */
export function generateEmail(name?: string): string {
  const baseName = name ? name.toLowerCase().replace(/\s+/g, '.').replace(/qa_/g, '') : `user${borrowerCounter}`;
  const timestamp = Date.now();
  const prefix = process.env.TEST_EMAIL_PREFIX || 'test';
  const domain = process.env.TEST_EMAIL_DOMAIN || 'test.com';
  return `${prefix}_${baseName}_${timestamp}@${domain}`;
}

/**
 * Generate unique borrower name with QA prefix
 */
export function generateBorrowerName(): { firstName: string; lastName: string; fullName: string } {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Amanda'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor'];
  
  const firstName = firstNames[borrowerCounter % firstNames.length];
  const lastName = lastNames[borrowerCounter % lastNames.length];
  borrowerCounter++;
  
  return {
    firstName: `QA_${firstName}`,
    lastName: `QA_${lastName}`,
    fullName: `QA_${firstName}_${lastName}`,
  };
}

/**
 * Generate loan amount based on loan type
 */
export function generateLoanAmount(loanType?: 'Personal' | 'Business' | 'Mortgage'): number {
  const type = loanType || 'Personal';
  const ranges = {
    Personal: { min: 5000, max: 50000 },
    Business: { min: 25000, max: 500000 },
    Mortgage: { min: 100000, max: 1000000 },
  };
  
  const range = ranges[type];
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
}

/**
 * Generate test loan application data
 */
export function generateLoanApplication(overrides?: {
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  loanAmount?: number;
  loanType?: 'Personal' | 'Business' | 'Mortgage';
  loanTerm?: number;
  interestRate?: number;
  purpose?: string;
}): {
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  loanAmount: number;
  loanType: string;
  loanTerm: number;
  interestRate: number;
  purpose: string;
} {
  const borrower = generateBorrowerName();
  const loanType = overrides?.loanType || 'Personal';
  
  return {
    borrowerName: overrides?.borrowerName || borrower.fullName,
    borrowerEmail: overrides?.borrowerEmail || generateEmail(borrower.fullName),
    borrowerPhone: overrides?.borrowerPhone || generatePhoneNumber(),
    loanAmount: overrides?.loanAmount || generateLoanAmount(loanType),
    loanType: loanType,
    loanTerm: overrides?.loanTerm || (loanType === 'Personal' ? 36 : loanType === 'Business' ? 60 : 360),
    interestRate: overrides?.interestRate || (Math.random() * 5 + 5).toFixed(2) as any,
    purpose: overrides?.purpose || `QA_Test_${loanType}_Loan_Purpose`,
  };
}

/**
 * Generate borrower information data
 */
export function generateBorrowerInfo(overrides?: {
  employmentStatus?: string;
  monthlyIncome?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ssn?: string;
  dateOfBirth?: string;
  creditScore?: number;
  collateralDetails?: string;
}): {
  employmentStatus: string;
  monthlyIncome: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ssn: string;
  dateOfBirth: string;
  creditScore: number;
  collateralDetails: string;
} {
  const cities = ['TestCity', 'QA_Town', 'Demo_City', 'Sample_City', 'Test_Metro'];
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'PA', 'OH'];
  
  return {
    employmentStatus: overrides?.employmentStatus || 'Full-time',
    monthlyIncome: overrides?.monthlyIncome || Math.floor(Math.random() * 10000 + 3000),
    address: overrides?.address || `${Math.floor(Math.random() * 9999 + 100)} QA_Test_Street`,
    city: overrides?.city || `QA_${cities[borrowerCounter % cities.length]}`,
    state: overrides?.state || states[borrowerCounter % states.length],
    zipCode: overrides?.zipCode || String(Math.floor(Math.random() * 90000 + 10000)),
    ssn: overrides?.ssn || `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    dateOfBirth: overrides?.dateOfBirth || `${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 30 + 1960)}`,
    creditScore: overrides?.creditScore || Math.floor(Math.random() * 250 + 600),
    collateralDetails: overrides?.collateralDetails || 'QA_Test_Collateral_Details',
  };
}

/**
 * Generate disbursement data
 */
export function generateDisbursementData(overrides?: {
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  disbursementAmount?: number;
  disbursementDate?: string;
  disbursementMethod?: string;
  notes?: string;
}): {
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankName: string;
  accountHolderName: string;
  disbursementAmount: number;
  disbursementDate: string;
  disbursementMethod: string;
  notes: string;
} {
  const borrower = generateBorrowerName();
  
  return {
    bankAccountNumber: overrides?.bankAccountNumber || String(Math.floor(Math.random() * 9000000000 + 1000000000)),
    bankRoutingNumber: overrides?.bankRoutingNumber || String(Math.floor(Math.random() * 900000000 + 100000000)),
    bankName: overrides?.bankName || `QA_Test_Bank_${borrowerCounter}`,
    accountHolderName: overrides?.accountHolderName || borrower.fullName,
    disbursementAmount: overrides?.disbursementAmount || generateLoanAmount(),
    disbursementDate: overrides?.disbursementDate || formatDate(getDateNDaysFromToday(1)),
    disbursementMethod: overrides?.disbursementMethod || 'ACH',
    notes: overrides?.notes || 'QA_Test_Disbursement_Notes',
  };
}

/**
 * Generate transaction reference
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now();
  const id = `QA_TXN_${timestamp}_${String(transactionCounter).padStart(3, '0')}`;
  transactionCounter++;
  return id;
}

/**
 * Generate finance disbursement data
 */
export function generateFinanceDisbursementData(overrides?: {
  transactionReference?: string;
  disbursementDate?: string;
  notes?: string;
}): {
  transactionReference: string;
  disbursementDate: string;
  notes: string;
} {
  return {
    transactionReference: overrides?.transactionReference || generateTransactionReference(),
    disbursementDate: overrides?.disbursementDate || formatDate(new Date()),
    notes: overrides?.notes || 'QA_Test_Finance_Notes',
  };
}

/**
 * Format date to YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to display format (MM/DD/YYYY)
 */
export function formatDateDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
}

/**
 * Get date N days from today
 */
export function getDateNDaysFromToday(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Get date N days ago
 */
export function getDateNDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Generate timestamp string
 */
export function generateTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Generate unique identifier
 */
export function generateUniqueId(): string {
  return `QA_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Reset all counters (useful for test cleanup)
 */
export function resetCounters(): void {
  applicationCounter = 1;
  borrowerCounter = 1;
  transactionCounter = 1;
}

/**
 * Generate complete loan application test data (for E2E tests)
 */
export function generateCompleteLoanData(loanType?: 'Personal' | 'Business' | 'Mortgage'): {
  application: ReturnType<typeof generateLoanApplication>;
  borrowerInfo: ReturnType<typeof generateBorrowerInfo>;
  disbursement: ReturnType<typeof generateDisbursementData>;
} {
  const application = generateLoanApplication({ loanType });
  const borrowerInfo = generateBorrowerInfo();
  const disbursement = generateDisbursementData({
    accountHolderName: application.borrowerName,
    disbursementAmount: application.loanAmount,
  });
  
  return {
    application,
    borrowerInfo,
    disbursement,
  };
}

/**
 * Generate test approval comments
 */
export function generateApprovalComments(): string {
  const comments = [
    'QA_Test_Approved - Good credit history',
    'QA_Test_Approved - Meets all requirements',
    'QA_Test_Approved - Verified employment',
    'QA_Test_Approved - Sufficient income',
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * Generate test rejection reasons
 */
export function generateRejectionReason(): string {
  const reasons = [
    'QA_Test_Rejected - Insufficient income',
    'QA_Test_Rejected - Poor credit score',
    'QA_Test_Rejected - Incomplete documentation',
    'QA_Test_Rejected - Employment verification failed',
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

/**
 * Generate test verification notes
 */
export function generateVerificationNotes(): string {
  return `QA_Test_Verification - All checks passed - ${generateTimestamp()}`;
}

/**
 * Wait for specified milliseconds (use sparingly in tests)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
