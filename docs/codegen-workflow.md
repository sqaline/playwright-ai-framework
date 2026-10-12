# Codegen + SmartPageObject Workflow

## 🎯 The Hybrid Approach

Combine **Playwright Codegen's accuracy** with **SmartPageObject's auto-healing** for the best results!

---

## 📋 Quick Start (5 Minutes)

### Step 1: Record with Codegen

```bash
npx playwright codegen YOUR_APP_URL/login
```

**What to do**:
1. Browser opens automatically
2. Log in as Maker (manually)
3. Navigate to an application
4. Click on Applicant tab
5. **Fill the form normally** - Codegen records everything
6. Click Submit when done
7. Copy the generated code from Codegen window
8. Save to a file (e.g., `recording.txt`)

---

### Step 2: Convert to SmartPageObject Config

```bash
node utils/codegen-to-config.js recording.txt pages/configs/maker-applicant-auto.ts
```

**Output**: Automatic field config with fallback selectors!

---

### Step 3: Use in Your Test

```typescript
import { FIELD_CONFIG } from './configs/maker-applicant-auto';

// In MakerWorkspacePage
async fillApplicantTabFromCodegen(data: any): Promise<void> {
  await this.smartFill(FIELD_CONFIG.mobileNumber, data.mobileNumber);
  await this.smartFill(FIELD_CONFIG.postCode, data.postCode);
  // ... etc
}
```

Done! You now have accurate selectors + auto-healing!

---

## 🔧 Detailed Walkthrough

### Option A: Record Full Form (Recommended)

**1. Start Codegen in inspection mode:**
```bash
# This opens browser + inspector
npx playwright codegen YOUR_APP_URL/login
```

**2. Perform actions in browser:**
- Login as Maker
- Open application APP-2026-000100 (or any application)
- Switch to Applicant tab
- Fill EVERY field you want to automate:
  - Mobile Number
  - Post Code
  - Address
  - Position
  - Employer
  - All dropdowns
  - etc.

**3. Copy generated code:**
- Codegen inspector shows the code
- Copy ALL of it
- Save to `recordings/maker-applicant-recording.txt`

**4. Convert:**
```bash
node utils/codegen-to-config.js \
  recordings/maker-applicant-recording.txt \
  pages/configs/maker-applicant-codegen.ts
```

**5. Review output:**
```typescript
// pages/configs/maker-applicant-codegen.ts
export const FIELD_CONFIG: Record<string, FieldConfig> = {
  mobileNumber: {
    name: 'Mobile Number',
    selectors: [
      'input[name="mobileNumber"]',  // From codegen
      'input[name="mobile"]',         // Auto-generated fallback
      'textarea[name="mobileNumber"]' // Auto-generated fallback
    ],
    required: true,
    type: 'text'
    // Example value: "0123456789"
  },
  // ... more fields
};
```

---

### Option B: Record Actions Only (Quick)

If you just want to see what selectors Codegen uses:

```bash
# Start codegen
npx playwright codegen YOUR_APP_URL

# Fill one field
# Copy just that line
# Example: page.locator('input[name="mobile"]').fill('0123456789')

# Use that selector directly in your config
```

---

## 📊 What the Converter Does

**Input (Codegen output)**:
```javascript
await page.locator('input[name="mobileNumber"]').fill('0123456789');
await page.locator('input[name="postCode"]').fill('50000');
await page.locator('select[name="maritalStatus"]').selectOption('Single');
```

**Output (SmartPageObject config)**:
```typescript
export const FIELD_CONFIG: Record<string, FieldConfig> = {
  mobileNumber: {
    name: 'Mobile Number',
    selectors: [
      'input[name="mobileNumber"]',    // ← From codegen (accurate!)
      'input[name="mobile"]',           // ← Auto-generated fallback
      'input[placeholder*="mobile" i]'  // ← Auto-generated fallback
    ],
    required: true,
    type: 'text'
  },
  
  postCode: {
    name: 'Post Code',
    selectors: [
      'input[name="postCode"]',         // ← From codegen
      'input[name="postalCode"]'        // ← Auto-generated fallback
    ],
    required: true,
    type: 'text'
  },
  
  maritalStatus: {
    name: 'Marital Status',
    selectors: [
      'select[name="maritalStatus"]',   // ← From codegen
      'select:has(option:has-text("Single"))'  // ← Auto-generated
    ],
    required: false,
    type: 'select'
  }
};
```

**Benefits**:
- ✅ Primary selector from Codegen (100% accurate)
- ✅ Automatic fallback selectors (for resilience)
- ✅ Ready to use with SmartPageObject
- ✅ Example values included as comments

---

## 🎯 Real Example

### 1. Record Maker Applicant Tab

```bash
# Terminal 1: Start codegen
npx playwright codegen YOUR_APP_URL/login

# In browser:
# - Login as Maker
# - Open APP-2026-000100
# - Click Applicant tab
# - Fill: Mobile Number = "0123456789"
# - Fill: Post Code = "50000"
# - Fill: Address = "Test Address"
# - Select: Marital Status = "Single"
# - Click Submit

# Codegen shows:
await page.locator('input[name="mobileNumber"]').fill('0123456789');
await page.locator('input[name="postCode"]').fill('50000');
await page.locator('input[name="address"]').fill('Test Address');
await page.locator('select').nth(1).selectOption('Single');
await page.locator('button:has-text("Submit")').click();

# Copy and save to recordings/maker-applicant.txt
```

### 2. Convert

```bash
node utils/codegen-to-config.js \
  recordings/maker-applicant.txt \
  pages/configs/maker-applicant-codegen.ts
```

**Output**:
```
✅ Conversion complete!

📊 Summary:
   - Fields extracted: 4
   - Text inputs: 3
   - Dropdowns: 1
   - Checkboxes: 0

📝 Generated config: pages/configs/maker-applicant-codegen.ts

💡 Next steps:
   1. Review the generated config file
   2. Adjust field names if needed
   3. Import into your Page Object
   4. Use with smartFill() methods!
```

### 3. Use in Test

```typescript
// pages/MakerWorkspacePage.ts
import { FIELD_CONFIG } from './configs/maker-applicant-codegen';

export class MakerWorkspacePage extends SmartPageObject {
  
  async fillApplicantTab(data: any): Promise<void> {
    console.log('\n📝 Filling Applicant tab (Codegen + SmartPageObject)...\n');

    await this.switchToTab('Applicant');
    
    // Use the codegen-generated configs with smartFill auto-healing!
    await this.smartFill(FIELD_CONFIG.mobileNumber, data.mobileNumber);
    await this.smartFill(FIELD_CONFIG.postCode, data.postCode);
    await this.smartFill(FIELD_CONFIG.address, data.address);
    await this.smartSelect(FIELD_CONFIG.maritalStatus, data.maritalStatus);
    
    console.log('\n✅ Applicant tab filled!\n');
  }
}
```

**Test**:
```typescript
await makerPage.fillApplicantTab({
  mobileNumber: '0123456789',
  postCode: '50000',
  address: 'Test Address',
  maritalStatus: 'Single'
});
```

---

## 🔄 Workflow Comparison

### Before (Manual Config)
```
1. Inspect element → 10 min
2. Find selector → 5 min
3. Test selector → 5 min
4. Add to config → 2 min
5. Add fallbacks → 5 min
────────────────────────
Total: 27 min per field
```

### After (Codegen + Converter)
```
1. Record with Codegen → 2 min  (all fields at once!)
2. Convert → 5 seconds
3. Review → 2 min
────────────────────────
Total: ~4 min for ALL fields
```

**Speed up: 6-7x faster!** ⚡

---

## 💡 Pro Tips

### Tip 1: Record Multiple Times
```bash
# If first recording missed some fields, just record again
npx playwright codegen YOUR_APP_URL

# Mix outputs - converter merges selectors automatically
```

### Tip 2: Keep Recordings
```
recordings/
  ├── maker-applicant.txt
  ├── maker-loan.txt
  ├── maker-expenses.txt
  └── supervisor-queue.txt
```

### Tip 3: Version Your Configs
```typescript
// If UI changes, record again and compare
// Keep old config as backup
export const FIELD_CONFIG_V1 = { ... };
export const FIELD_CONFIG_V2 = { ... };  // New recording
```

### Tip 4: Combine with Manual Tweaks
```typescript
// After codegen conversion, you can still add custom selectors
import { FIELD_CONFIG } from './maker-applicant-codegen';

// Add extra fallback
FIELD_CONFIG.mobileNumber.selectors.push('input[type="tel"]');
```

---

## ✅ Success Criteria

After using this workflow, you should have:

- [ ] Accurate selectors from Codegen
- [ ] Automatic fallback strategies
- [ ] Ready-to-use field configs
- [ ] SmartPageObject auto-healing
- [ ] 6-7x faster config generation

---

## 🚀 Next Steps

1. **Try it now**: Record Applicant tab with Codegen
2. **Convert**: Use the converter script
3. **Test**: Run your test with the new config
4. **Expand**: Record Loan tab, Expenses tab, etc.

---

**Time to get accurate selectors**: 5 minutes  
**Time saved on debugging**: Hours!  

Let's do this! 🎯
