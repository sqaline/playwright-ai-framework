# 🚀 Quick Start: Record Your First Form

## Ready to Try? Here's How (5 Minutes)

### Step 1: Start Codegen (1 minute)

Open a new terminal and run:

```bash
npx playwright codegen YOUR_APP_URL/login
```

**What happens**:
- ✅ Browser opens automatically
- ✅ Playwright Inspector opens (record window)

---

### Step 2: Record Actions (2 minutes)

**In the browser** (Codegen is recording):

1. **Login** as Maker (manually type credentials)
2. **Navigate** to Maker workspace
3. **Click** on an application (e.g., APP-2026-000100)
4. **Click** on "Applicant" tab
5. **Fill the form**:
   - Mobile Number: Type "0123456789"
   - Post Code: Type "50000"  
   - Address: Type "Test Address"
   - Area: Type "Kuala Lumpur"
   - Position: Type "Engineer"
   - Employer: Type "Company"
   - Marital Status: Select "Single"
6. **Click** Submit

**In the Inspector window**:
- You'll see code being generated as you type!
- It looks like this:
  ```javascript
  await page.locator('input[name="mobile"]').fill('0123456789');
  await page.locator('input[name="postCode"]').fill('50000');
  // ... etc
  ```

---

### Step 3: Save the Recording (30 seconds)

In the **Playwright Inspector**:

1. Select ALL the generated code (Ctrl+A / Cmd+A)
2. Copy it (Ctrl+C / Cmd+C)
3. Create a new file: `recordings/maker-applicant-real.txt`
4. Paste the code
5. Save the file

---

### Step 4: Convert to Config (5 seconds)

```bash
node utils/codegen-to-config.js \
  recordings/maker-applicant-real.txt \
  pages/configs/maker-applicant-real.ts
```

**Output**:
```
✅ Conversion complete!

📊 Summary:
   - Fields extracted: 8
   - Text inputs: 6
   - Dropdowns: 2

📝 Generated config: pages/configs/maker-applicant-real.ts
```

---

### Step 5: Use It! (1 minute)

Update `pages/MakerWorkspacePage.ts`:

```typescript
// Add import at top
import { FIELD_CONFIG } from './configs/maker-applicant-real';

// Add new method
async fillApplicantTabFromCodegen(data: any): Promise<void> {
  await this.switchToTab('Applicant');
  
  // Use the auto-generated configs!
  await this.smartFill(FIELD_CONFIG.mobileNumber, data.mobileNumber);
  await this.smartFill(FIELD_CONFIG.postCode, data.postCode);
  await this.smartFill(FIELD_CONFIG.address, data.address);
  await this.smartFill(FIELD_CONFIG.area, data.area);
  await this.smartFill(FIELD_CONFIG.position, data.position);
  await this.smartFill(FIELD_CONFIG.employer, data.employer);
  await this.smartSelect(FIELD_CONFIG.maritalStatus, data.maritalStatus);
  
  await this.submitForApproval();
}
```

---

### Step 6: Test It!

```bash
# Create a quick test
npx playwright test tests/regression/maker-smart-fill.spec.ts --headed
```

**Result**: Form fills with accurate selectors + auto-healing! 🎉

---

## 📊 What You Just Got

✅ **Accurate selectors** - From Codegen (100% correct for current UI)  
✅ **Fallback selectors** - Auto-generated (for resilience)  
✅ **Auto-healing** - SmartPageObject handles failures  
✅ **Example values** - Included as comments  
✅ **TypeScript types** - Full type safety  

---

## 💡 Pro Tips

### Tip 1: Record Once, Use Forever
Your recording captures the exact selectors used in your UI right now. Even if the UI changes slightly, the fallback selectors will handle it!

### Tip 2: Record Per Tab
```bash
# Record Applicant tab
npx playwright codegen ...  
# → recordings/applicant-tab.txt

# Later, record Loan tab
npx playwright codegen ...
# → recordings/loan-tab.txt

# Convert each separately
node utils/codegen-to-config.js recordings/applicant-tab.txt pages/configs/applicant.ts
node utils/codegen-to-config.js recordings/loan-tab.txt pages/configs/loan.ts
```

### Tip 3: Re-record When UI Changes
If selectors break after a UI update:
```bash
# Just record again!
npx playwright codegen ...
# Convert again
node utils/codegen-to-config.js ...
# Replace old config
```

---

## 🎯 Next: Record All Your Forms!

Now that you know how, record:
- ✅ Maker - Applicant tab (done!)
- ⏭️ Maker - Loan tab
- ⏭️ Maker - Expenses tab
- ⏭️ Supervisor - Queue actions
- ⏭️ Approval workflow
- ⏭️ Finance workflow

**Each one takes ~5 minutes total!**

---

## ❓ Troubleshooting

**Q: Codegen isn't recording my actions**  
A: Make sure the Inspector window is visible and "Record" is highlighted (red circle)

**Q: Some fields aren't in the output**  
A: Codegen only records `fill()`, `selectOption()`, and `click()`. If a field wasn't recorded, fill it again in Codegen.

**Q: Converter says "no fields extracted"**  
A: Check that your recording file has Playwright code (`.fill()`, `.selectOption()` methods)

**Q: Generated selectors don't work**  
A: The primary selector from Codegen should always work. If not, the field might be disabled or the page structure changed.

---

**Ready to try?** Run this now:

```bash
npx playwright codegen YOUR_APP_URL/login
```

Then follow the steps above! 🚀
