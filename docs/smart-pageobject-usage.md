# How to Use SmartPageObject - Practical Guide

## 🎯 Quick Start (3 Ways to Use)

### Option 1: Use in Existing Maker Workflow Test

**File**: `tests/regression/maker-workflow.spec.ts` (your existing test)

**Before** (old way):
```typescript
// Old method - manual selectors, no auto-healing
await makerPage.fillPersonalInformation({
  name: 'Test Name',
  mobile: '0123456789',
  // ... might fail if selectors are wrong
});
```

**After** (new way with auto-healing):
```typescript
// New method - auto-healing enabled!
await makerPage.fillApplicantTabSmart({
  mobileNumber: '0123456789',
  postCode: '50000',
  address: 'Test Address',
  area: 'Kuala Lumpur',
  position: 'Engineer',
  employer: 'Test Company',
  lengthOfService: '24',
  employeeContact: '0321234567',
  maritalStatus: 'Single',
  country: 'Malaysia',
  race: 'Malay'
});
```

---

### Option 2: Update Your Existing Test

Open your current Maker workflow test and add the smart method:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { MakerWorkspacePage } from '../../pages/MakerWorkspacePage';

test('Maker workflow - Stage 3 with auto-healing', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const makerPage = new MakerWorkspacePage(page);

  await loginPage.loginAsMaker();
  await makerPage.goto();
  
  // Open your application
  await makerPage.openApplicationDetail('APP-2026-000100');
  await makerPage.waitForFormLoad();

  // ⚡ USE SMART FILL - Auto-healing enabled!
  await makerPage.fillApplicantTabSmart({
    mobileNumber: '0123456789',
    postCode: '50000',
    address: 'QA Test Address',
    area: 'Kuala Lumpur',
    position: 'QA Engineer',
    employer: 'Test Company',
    lengthOfService: '24',
    employeeContact: '0321234567',
    maritalStatus: 'Single',
    country: 'Malaysia'
  });

  // Continue with rest of your workflow
  await makerPage.saveProgress();
  
  // ... rest of your test
});
```

---

### Option 3: Create New Test for Specific Scenario

```typescript
test('Fill only required fields (minimal test)', async ({ page }) => {
  const makerPage = new MakerWorkspacePage(page);
  
  // ... login and navigation
  
  // Fill only required text fields
  await makerPage.fillApplicantTabSmart({
    mobileNumber: '0123456789',
    postCode: '50000',
    address: 'Test Address',
    area: 'KL',
    position: 'Engineer',
    employer: 'Company',
    lengthOfService: '12',
    employeeContact: '0321234567'
    // Dropdowns are optional, will be skipped
  });
});
```

---

## 🔧 How to Customize Selectors

If a field isn't being found, add your own selector strategy:

**File**: `pages/configs/maker-applicant-fields.ts`

```typescript
// Example: Mobile number field not found
mobileNumber: {
  name: 'Mobile Number',
  selectors: [
    'input[name="mobile"]',
    'input[name="mobileNumber"]',
    'YOUR_ACTUAL_SELECTOR_HERE',  // ← Add your selector
    'input[placeholder*="mobile" i]',
    'input[type="tel"]'
  ],
  required: true
}
```

**How to find your selector**:
1. Run test in headed mode: `--headed`
2. Right-click the field → Inspect
3. Look for `name`, `id`, or `placeholder` attribute
4. Add to selectors array

---

## 📋 Adding More Tabs

### Example: Add Loan Tab support

**Step 1**: Create config file
**File**: `pages/configs/maker-loan-fields.ts`

```typescript
import { FieldConfig } from '../SmartPageObject';

export const MAKER_LOAN_FIELDS: Record<string, FieldConfig> = {
  tenure: {
    name: 'Loan Tenure',
    selectors: [
      'input[name="tenure"]',
      'input[name="loanTenure"]',
      'input[placeholder*="tenure" i]'
    ],
    required: true
  },
  
  amount: {
    name: 'Loan Amount',
    selectors: [
      'input[name="amount"]',
      'input[name="loanAmount"]',
      'input[placeholder*="amount" i]'
    ],
    required: true
  }
  
  // ... add more fields
};
```

**Step 2**: Add method to MakerWorkspacePage

```typescript
import { MAKER_LOAN_FIELDS } from './configs/maker-loan-fields';

// Add inside MakerWorkspacePage class:
async fillLoanTabSmart(data: {
  tenure: string;
  amount: string;
}): Promise<void> {
  console.log('\n📝 Filling Loan tab (SMART MODE)...\n');
  
  await this.switchToTab('Loan');
  await this.page.waitForTimeout(1000);
  
  await this.smartFill(MAKER_LOAN_FIELDS.tenure, data.tenure);
  await this.smartFill(MAKER_LOAN_FIELDS.amount, data.amount);
  
  console.log('\n✅ Loan tab filled (SMART MODE)\n');
}
```

**Step 3**: Use in test

```typescript
await makerPage.fillLoanTabSmart({
  tenure: '60',
  amount: '100000'
});
```

---

## 🐛 Debugging Tips

### See What's Happening

**Console output shows everything**:
```
📝 Filling Mobile Number...
  ⚠️ "input[name='mobile']" not found, trying next...
  ✅ Mobile Number: "0123456789"
```

### Field Not Filling?

1. **Check if disabled**:
   ```
   ℹ️ Mobile Number is disabled (pre-filled), skipping
   ```
   → This is EXPECTED for read-only fields

2. **All selectors failed**:
   ```
   ⚠️ "selector1" not found, trying next...
   ⚠️ "selector2" not found, trying next...
   ❌ Failed to fill required field: Mobile Number
   ```
   → Add correct selector to config file

3. **Run in debug mode**:
   ```bash
   npx playwright test maker-smart-fill.spec.ts --debug
   ```

### Check Screenshots

After test runs, check `playwright-report/`:
- `smart-fill-01-before.png` - Before filling
- `smart-fill-02-after.png` - After filling
- `smart-fill-03-saved.png` - After save

---

## ✅ Usage Checklist

- [ ] Found valid application ID (use `find-maker-apps.spec.ts`)
- [ ] Updated test with application ID
- [ ] Ran test in headed mode to verify
- [ ] Checked console logs for auto-healing
- [ ] Verified fields filled correctly
- [ ] Reviewed screenshots
- [ ] Integrated into existing workflow

---

## 🎯 Real-World Example

**Your current Maker workflow issue**: "Application tab not filling"

**Solution**: Use `fillApplicantTabSmart()` instead of manual filling

**In your Stage 3 test**:
```typescript
test('Stage 3: Data Entry', async ({ makerFixture }) => {
  const { page, makerPage } = makerFixture;
  
  // OLD WAY (might fail)
  // await makerPage.fillPersonalInformation({ ... });
  
  // NEW WAY (auto-healing)
  await makerPage.fillApplicantTabSmart({
    mobileNumber: testData.maker.applicant.mobileNumber,
    postCode: testData.maker.applicant.postCode,
    address: testData.maker.applicant.address,
    // ... rest of your test data
  });
  
  // Framework handles:
  // ✅ Wrong selectors → tries alternatives
  // ✅ Disabled fields → skips automatically  
  // ✅ Timing issues → waits and retries
  // ✅ Dropdowns → auto-detects type
});
```

---

**Next Steps**:
1. ✅ Test is running with valid app ID
2. Watch console output for auto-healing diagnostics
3. Once test passes, integrate into your workflow
4. Add more tabs (Loan, Expenses, etc.) as needed
