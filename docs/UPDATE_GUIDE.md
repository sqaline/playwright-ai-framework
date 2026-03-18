# Framework Update Guide

## Overview

This guide explains how to update the framework in existing projects and manage framework versions.

## Checking for Updates

### 1. Check Framework Version

Check your current framework version in `package.json`:

```json
{
  "name": "my-automation",
  "version": "1.0.0",
  "framework": {
    "name": "automation-framework",
    "version": "1.0.0"
  }
}
```

### 2. Check for New Versions

Review the framework's `CHANGELOG.md` to see what's new:

```bash
# From your framework directory
cat CHANGELOG.md
```

## Updating Existing Projects

### Method 1: Using the Update Script (Recommended)

The easiest way to update is using the framework update script:

```bash
# From your project directory
cd /path/to/your/project

# Set framework path and run update
FRAMEWORK_PATH=/path/to/automation-framework \
  npx ts-node /path/to/automation-framework/tools/extract-framework.ts
```

The script will:
1. ✅ Backup your current framework files
2. ✅ Copy the latest framework files
3. ✅ Check for conflicts
4. ✅ Show you what changed

### Method 2: Manual Update

For more control, manually update specific files:

```bash
# From your project directory
cd /path/to/your/project

# Backup current files
mkdir .framework-backup
cp pages/BasePage.ts .framework-backup/
cp pages/SmartPageObject.ts .framework-backup/
cp utils/*.ts .framework-backup/
cp scripts/*.ts .framework-backup/

# Copy new framework files
cp /path/to/automation-framework/framework-core/pages/BasePage.ts pages/
cp /path/to/automation-framework/framework-core/pages/SmartPageObject.ts pages/
cp /path/to/automation-framework/framework-core/utils/*.ts utils/
cp /path/to/automation-framework/framework-core/scripts/*.ts scripts/
```

### Method 3: Git-Based Update

If both your project and framework are git repositories:

```bash
# Add framework as remote
git remote add framework /path/to/automation-framework

# Fetch framework changes
git fetch framework

# Merge framework changes
git merge framework/main --no-ff

# Resolve conflicts if any
# Review changes
git diff HEAD~1

# Test your changes
npm test

# Commit if successful
git commit -m "Update framework to v1.1.0"
```

## Handling Breaking Changes

### 1. Review the Changelog

Always review `CHANGELOG.md` before updating:

```markdown
## [1.1.0] - 2026-03-20

### Breaking Changes
- Renamed `waitForElement` to `waitForElementVisible`
- Changed signature of `smartFill` - now requires explicit field type

### Added
- New `waitForClickable` method in BasePage
- Support for multi-select dropdowns in SmartPageObject

### Fixed
- Fixed timeout issue in `waitForNetworkIdle`
```

### 2. Run Your Test Suite

After updating, run your full test suite:

```bash
# Run all tests
npm test

# Check for failures
npm test -- --reporter=list
```

### 3. Update Affected Code

If there are breaking changes, update your code accordingly:

```typescript
// Before (v1.0.0)
await page.waitForElement('#button');

// After (v1.1.0)
await page.waitForElementVisible('#button');
```

### 4. Use Backup if Needed

If the update breaks your tests, restore from backup:

```bash
# Restore from backup
cp -r .framework-backup/* pages/
cp -r .framework-backup/utils/* utils/
cp -r .framework-backup/scripts/* scripts/

# Or revert git changes
git revert HEAD
```

## Migration Guide

### Migrating from v1.0.0 to v1.1.0

#### Breaking Change: `waitForElement` renamed

**Old Code:**
```typescript
await page.waitForElement('#submit-button');
```

**New Code:**
```typescript
await page.waitForElementVisible('#submit-button');
// or use the new specific method
await page.waitForClickable('#submit-button');
```

#### Breaking Change: `smartFill` requires field type

**Old Code:**
```typescript
const config: FieldConfig = {
  name: 'Email',
  selectors: ['input[name="email"]'],
  required: true
};
```

**New Code:**
```typescript
const config: FieldConfig = {
  name: 'Email',
  selectors: ['input[name="email"]'],
  required: true,
  type: 'text' // Required in v1.1.0
};
```

### Migration Checklist

- [ ] Read CHANGELOG.md for breaking changes
- [ ] Backup current framework files
- [ ] Update framework files
- [ ] Run full test suite
- [ ] Update affected code
- [ ] Fix any failing tests
- [ ] Update framework version in package.json
- [ ] Commit changes

## Rollback Procedure

If you need to rollback to a previous framework version:

### 1. Restore from Backup

```bash
# Restore all files from backup
cp -r .framework-backup/* .

# Remove backup after confirming rollback works
rm -rf .framework-backup
```

### 2. Git Rollback

```bash
# Revert the last commit
git revert HEAD

# Or reset to previous commit
git reset --hard HEAD~1
```

### 3. Update Version Number

Update `package.json` to reflect the rolled-back version:

```json
{
  "framework": {
    "name": "automation-framework",
    "version": "1.0.0" // Reverted version
  }
}
```

## Version Management

### Semantic Versioning

The framework follows semantic versioning:

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, backward compatible

### Updating Version in Your Project

After successfully updating the framework, update your version tracking:

```json
{
  "name": "my-automation",
  "version": "1.1.0",
  "framework": {
    "name": "automation-framework",
    "version": "1.1.0"
  }
}
```

### Git Tagging

Tag your commits with framework versions:

```bash
# Tag the commit with the framework version
git tag -a v1.1.0 -m "Updated to framework v1.1.0"

# Push tags
git push origin v1.1.0
```

## Best Practices

### 1. Always Backup

Before updating, always backup your framework files:

```bash
# Use the update script (backs up automatically)
npx ts-node tools/extract-framework.ts

# Or manually backup
cp -r pages utils scripts .framework-backup
```

### 2. Test Thoroughly

Run your full test suite after updating:

```bash
# Run all tests
npm test

# Run with detailed output
npm test -- --reporter=list

# Run in parallel for speed
npm test -- --workers=4
```

### 3. Review Changes

Review what changed before committing:

```bash
# See what files changed
git status

# See the actual changes
git diff framework-core/
```

### 4. Document Customizations

If you've customized framework files, document them:

```typescript
// BasePage.ts - Customized
// Added custom method: waitForModal
// Reason: Application uses custom modal component
```

### 5. Stay Updated

Regularly check for framework updates:

```bash
# Every month or quarter
cd /path/to/automation-framework
git pull
cat CHANGELOG.md
```

## Troubleshooting

### Tests Failing After Update

**Problem:** Tests are failing after framework update.

**Solutions:**
1. Review the CHANGELOG.md for breaking changes
2. Run tests with verbose output: `npm test -- --reporter=list`
3. Check if selectors changed in SmartPageObject configs
4. Verify API changes in BasePage methods
5. Compare old and new framework files

### Conflicts with Custom Code

**Problem:** You have custom code that conflicts with framework updates.

**Solutions:**
1. Don't modify framework files directly - extend them instead
2. Create custom methods in your page objects
3. Use composition over inheritance where possible
4. Document your customizations

### Rollback Needed

**Problem:** Need to rollback to previous framework version.

**Solutions:**
1. Restore from `.framework-backup` directory
2. Use `git revert` if using git
3. Manually copy old framework files
4. Test thoroughly after rollback

## Summary

| Task | Command | Notes |
|------|---------|-------|
| Check version | `cat package.json \| grep framework` | Check current version |
| Check updates | `cat CHANGELOG.md` | See what's new |
| Update framework | `npx ts-node tools/extract-framework.ts` | Automatic backup |
| Manual update | `cp framework-core/* .` | More control |
| Run tests | `npm test` | Verify update |
| Rollback | `cp -r .framework-backup/* .` | Restore from backup |

## Need Help?

- Check the framework guide: `docs/FRAMEWORK_GUIDE.md`
- Review pattern guide: `docs/PATTERN_GUIDE.md`
- Check Playwright documentation: https://playwright.dev
- Review example tests: `framework-core/tests/examples/`
