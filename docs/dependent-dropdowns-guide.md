# Dependent Dropdowns (Cascading) - Usage Guide

## 🎯 What Are Dependent Dropdowns?

Dependent dropdowns are dropdown fields where the available options in one dropdown depend on the selection made in another dropdown.

**Example**: 
- Select **Country** = "Malaysia"
- Then **State** dropdown populates with Malaysian states
- Then **City** dropdown populates with cities from selected state

---

## ✅ SmartPageObject Now Handles This!

The updated `smartSelect()` method now:
- ⏳ Waits for dependent options to populate
- 🔍 Checks if options are loaded before selecting
- 🔄 Retries if options aren't ready yet
- ⚡ Triggers cascade updates after selection

---

## 📝 How to Use

### Step 1: Mark Dependencies in Field Config

**File**: `pages/configs/maker-applicant-fields.ts`

```typescript
export const MAKER_APPLICANT_FIELDS: Record<string, FieldConfig> = {
  // Independent field (no dependencies)
  country: {
    name: 'Country',
    selectors: ['select[name="country"]'],
    type: 'select'
  },

  // Dependent on country
  state: {
    name: 'State/Province',
    selectors: ['select[name="state"]', 'select[name="province"]'],
    type: 'select',
    dependsOn: ['country']  // ← Marks this as dependent on country
  },

  // Dependent on state
  city: {
    name: 'City',
    selectors: ['select[name="city"]'],
    type: 'select',
    dependsOn: ['state']  // ← Dependent on state
  }
};
```

---

### Step 2: Fill in Correct Order

**In your test or Page Object method**:

```typescript
async fillLocationSmart(data: {
  country: string;
  state: string;
  city: string;
}): Promise<void> {
  // 1. Fill independent field first
  await this.smartSelect(MAKER_APPLICANT_FIELDS.country, data.country);

  // 2. Fill dependent field (it will wait for options to populate)
  await this.smartSelect(
    MAKER_APPLICANT_FIELDS.state, 
    data.state,
    { dependsOn: ['country'], waitForOptions: 1500 }  // ← Pass dependency info
  );

  // 3. Fill next level dependent field
  await this.smartSelect(
    MAKER_APPLICANT_FIELDS.city, 
    data.city,
    { dependsOn: ['state'], waitForOptions: 1500 }
  );
}
```

**Console Output**:
```
📋 Selecting Country: Malaysia
  ✅ Country: "Malaysia"

📋 Selecting State/Province: Kuala Lumpur
  ⏳ Waiting for dependent options (depends on: country)...
  ✅ State/Province: "Kuala Lumpur"

📋 Selecting City: Cheras
  ⏳ Waiting for dependent options (depends on: state)...
  ✅ City: "Cheras"
```

---

## 🔧 Configuration Options

```typescript
await this.smartSelect(config, value, {
  dependsOn: ['fieldName1', 'fieldName2'],  // Parent fields
  waitForOptions: 2000  // Wait time in ms (default: 1000ms)
});
```

---

## 📋 Real Example: Employment Dropdowns

Some employment fields might be dependent:

```typescript
export const MAKER_APPLICANT_FIELDS: Record<string, FieldConfig> = {
  employmentType: {
    name: 'Employment Type',
    selectors: ['select[name="employmentType"]'],
    type: 'select'
  },

  // Sector options depend on employment type
  employmentSector: {
    name: 'Employment Sector',
    selectors: ['select[name="employmentSector"]'],
    type: 'select',
    dependsOn: ['employmentType']  // Different sectors for Private vs Government
  },

  // Industry options depend on sector
  industry: {    name: 'Industry',
    selectors: ['select[name="industry"]'],
    type: 'select',
    dependsOn: ['employmentSector']  // Industries vary by sector
  }
};
```

**Usage**:
```typescript
await makerPage.smartSelect(MAKER_APPLICANT_FIELDS.employmentType, 'Private');

await makerPage.smartSelect(
  MAKER_APPLICANT_FIELDS.employmentSector, 
  'Manufacturing',
  { dependsOn: ['employmentType'], waitForOptions: 1000 }
);

await makerPage.smartSelect(
  MAKER_APPLICANT_FIELDS.industry, 
  'Technology',
  { dependsOn: ['employmentSector'], waitForOptions: 1000 }
);
```

---

## 🐛 Troubleshooting

### Issue: "No options available"

**Console shows**:
```
⏳ Options not loaded yet, waiting...
⚠️ No options available in "select[name='state']", trying next...
```

**Solutions**:
1. **Increase wait time**:
   ```typescript
   await this.smartSelect(config, value, {
     dependsOn: ['country'],
     waitForOptions: 2000  // Increase from 1000ms to 2000ms
   });
   ```

2. **Check parent field was filled correctly**:
   - Ensure parent dropdown was selected successfully
   - Verify the value matches exactly (case-sensitive)

3. **Check network delay**:
   - If options load via API, you might need longer wait
   - Use `waitForOptions: 3000` or more

---

### Issue: Wrong options appearing

**Cause**: Parent field wasn't selected, so dropdown shows default options

**Solution**: Always fill in order - parent first, then child:
```typescript
// ✅ CORRECT ORDER
await this.smartSelect(MAKER_APPLICANT_FIELDS.country, 'Malaysia');
await this.smartSelect(MAKER_APPLICANT_FIELDS.state, 'Selangor', 
  { dependsOn: ['country'] });

// ❌ WRONG ORDER - state will have no/wrong options
await this.smartSelect(MAKER_APPLICANT_FIELDS.state, 'Selangor');
await this.smartSelect(MAKER_APPLICANT_FIELDS.country, 'Malaysia');
```

---

## ✅ What SmartSelect Does Automatically

1. **Waits for cascade** (if `dependsOn` specified)
2. **Checks option count** before selecting
3. **Retries** if options aren't loaded
4. **Waits after selection** to trigger next dropdown
5. **Logs everything** for debugging

---

## 📊 Example: Complete Maker Form with Dependencies

```typescript
async fillApplicantTabSmart(data: any): Promise<void> {
  // Independent fields (order doesn't matter)
  await this.smartFill(MAKER_APPLICANT_FIELDS.mobileNumber, data.mobileNumber);
  await this.smartFill(MAKER_APPLICANT_FIELDS.address, data.address);

  // --- Cascading dropdowns (order MATTERS) ---

  // Level 1: Country (independent)
  await this.smartSelect(MAKER_APPLICANT_FIELDS.country, data.country);

  // Level 2: State (depends on country)
  if (data.state) {
    await this.smartSelect(
      MAKER_APPLICANT_FIELDS.state, 
      data.state,
      { dependsOn: ['country'], waitForOptions: 1500 }
    );
  }

  // Level 2: Employment Type (independent)
  await this.smartSelect(MAKER_APPLICANT_FIELDS.employmentType, data.employmentType);

  // Level 3: Sector (depends on employment type)
  if (data.employmentSector) {
    await this.smartSelect(
      MAKER_APPLICANT_FIELDS.employmentSector,
      data.employmentSector,
      { dependsOn: ['employmentType'], waitForOptions: 1000 }
    );
  }
}
```

---

## 🎯 Summary

**Before (manual handling)**:
```typescript
await page.selectOption('select[name="country"]', 'Malaysia');
await page.waitForTimeout(2000); // Hope options load
await page.selectOption('select[name="state"]', 'Selangor'); // Might fail!
```

**After (SmartPageObject)**:
```typescript
await this.smartSelect(MAKER_APPLICANT_FIELDS.country, 'Malaysia');
await this.smartSelect(MAKER_APPLICANT_FIELDS.state, 'Selangor', 
  { dependsOn: ['country'], waitForOptions: 1500 });
// ✅ Auto-waits, checks options, retries if needed
```

---

**Key Benefits**:
- ✅ Automatic wait for cascading updates
- ✅ Option population detection
- ✅ Clear logging of dependencies
- ✅ Retry mechanism built-in
- ✅ No manual timing guesswork

---

**Next Steps**:
1. Identify your dependent dropdowns
2. Mark them with `dependsOn` in field config
3. Fill in correct order (parent → child)
4. Pass `{ dependsOn: [...] }` to smartSelect
5. Adjust `waitForOptions` if needed
