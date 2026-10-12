# Codegen + Page Object Model (POM) - Best Practices

## 🎯 The Right Way: Keep POM Architecture

**Key Principle**: Selectors live in Page Objects, NOT in tests!

---

## ✅ Correct Approach

### Page Object (MakerWorkspacePage.ts)
```typescript
export class MakerWorkspacePage extends BasePage {
  
  /**
   * Fill Applicant Tab
   * Selectors from Codegen recording, encapsulated in method
   */
  async fillApplicantTab(data: { ... }): Promise<void> {
    // Codegen selectors go HERE (in Page Object)
    await this.page.getByRole('textbox', { name: 'Post Code *' }).fill(data.postCode);
    await this.page.getByRole('textbox', { name: 'Address *' }).fill(data.address);
    // ... more fields
  }
}
```

### Test (Clean!)
```typescript
test('Maker workflow', async ({ page }) => {
  const makerPage = new MakerWorkspacePage(page);
  
  // Test only calls methods - NO selectors!
  await makerPage.fillApplicantTab({
    postCode: '54000',
    address: 'Test Address'
  });
});
```

---

## ❌ Wrong Approach

### Test (Bad - selectors exposed!)
```typescript
test('Maker workflow', async ({ page }) => {
  // ❌ DON'T DO THIS - selectors in test file!
  await page.getByRole('textbox', { name: 'Post Code *' }).fill('54000');
  await page.getByRole('textbox', { name: 'Address *' }).fill('Test');
})
```

---

## 🔄 Workflow: Codegen → POM

### Step 1: Record with Codegen
```bash
npx playwright codegen YOUR_APP_URL/login
# Fill the form manually
# Codegen generates:
# await page.getByRole('textbox', { name: 'Post Code *' }).fill('54000');
```

### Step 2: Copy Selectors to Page Object
```typescript
// In MakerWorkspacePage.ts
async fillApplicantTab(data: any): Promise<void> {
  // ✅ Paste Codegen selectors here
  await this.page.getByRole('textbox', { name: 'Post Code *' }).fill(data.postCode);
  await this.page.getByRole('textbox', { name: 'Address *' }).fill(data.address);
  // ...
}
```

### Step 3: Use in Test (Clean!)
```typescript
// Test file stays clean
await makerPage.fillApplicantTab({
  postCode: testData.postCode,
  address: testData.address
});
```

---

## 📊 Benefits of This Approach

| Aspect | Benefit |
|--------|---------|
| **Maintainability** | Selectors in ONE place (Page Object) |
| **Accuracy** | Codegen selectors (100% accurate) |
| **Reusability** | One method, many tests |
| **Readability** | Tests are business logic, not technical selectors |
| **POM Compliance** | Maintains proper architecture |

---

## 🛠️ Real Example

### Before (Broken POM):
```typescript
// Test file - mixing business logic with selectors ❌
test('Fill form', async ({ page }) => {
  await page.goto('/workspace');
  await page.getByText('APP-001').click();
  await page.getByRole('button', { name: 'Detail' }).click();
  await page.getByRole('textbox', { name: 'Post Code *' }).fill('54000');
  await page.getByRole('textbox', { name: 'Address *' }).fill('Test');
  // ... 20 more lines of selectors
});
```

### After (Proper POM):
```typescript
// Page Object - encapsulates selectors ✅
export class MakerWorkspacePage extends BasePage {
  async goto() {
    await this.page.goto('/workspace');
  }

  async openApplication(id: string) {
    await this.page.getByText(id).click();
    await this.page.getByRole('button', { name: 'Detail' }).click();
  }

  async fillApplicantTab(data: any) {
    await this.page.getByRole('textbox', { name: 'Post Code *' }).fill(data.postCode);
    await this.page.getByRole('textbox', { name: 'Address *' }).fill(data.address);
    // ... all selectors here
  }
}

// Test - clean business logic ✅
test('Fill form', async ({ page }) => {
  const makerPage = new MakerWorkspacePage(page);
  await makerPage.goto();
  await makerPage.openApplication('APP-001');
  await makerPage.fillApplicantTab({ postCode: '54000', address: 'Test' });
});
```

---

## 🎯 Template for Your Page Objects

```typescript
export class MyPageObject extends BasePage {
  
  /**
   * [ACTION DESCRIPTION]
   * 
   * Selectors from Codegen recording: [DATE]
   * To update: Re-record and replace selectors below
   */
  async myAction(data: {
    field1: string;
    field2: string;
  }): Promise<void> {
    console.log('Performing action...');
    
    // ═══════════════════════════════════════════
    // Codegen selectors go here
    // ═══════════════════════════════════════════
    await this.page.getByRole('textbox', { name: 'Field 1' }).fill(data.field1);
    await this.page.getByRole('textbox', { name: 'Field 2' }).fill(data.field2);
    
    console.log('✅ Action complete');
  }
}
```

---

## 💡 Key Takeaways

1. ✅ **Codegen selectors are great** - use them!
2. ✅ **Keep POM architecture** - selectors in Page Objects
3. ✅ **Tests stay clean** - only method calls
4. ✅ **Easy maintenance** - re-record when UI changes
5. ✅ **Best of both worlds** - accuracy + architecture

---

## 🚀 Your Workflow Summary

1. **Record**: `npx playwright codegen ...`
2. **Copy**: Codegen selector code
3. **Paste**: Into Page Object method
4. **Use**: Call method from test
5. **Maintain**: Re-record when UI changes

**POM architecture maintained ✅**  
**Codegen accuracy achieved ✅**  
**Tests stay clean ✅**

---

**Example Files**:
- `pages/MakerWorkspacePageCodegen.ts` - Page Object with Codegen selectors
- `tests/regression/maker-pom-codegen.spec.ts` - Clean test using Page Object

**Run example**:
```bash
npx playwright test tests/regression/maker-pom-codegen.spec.ts --headed
```
