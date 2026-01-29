# Git Hooks Documentation

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to enforce code quality locally before commits and pushes.

---

## Overview

Git hooks automatically run quality checks at specific points in your git workflow:

- **pre-commit**: Fast checks on staged files only (linting, formatting)
- **pre-push**: Comprehensive checks before pushing (typecheck, tests)

---

## Installation

Git hooks are automatically installed when you run:

```bash
npm install
```

The `prepare` script in `package.json` runs `husky` which sets up the hooks.

### Manual Installation

If hooks are not working, you can manually reinstall them:

```bash
npm run prepare
```

---

## Pre-commit Hook

**Location**: `.husky/pre-commit`

**Purpose**: Run fast quality checks on staged files only

**What it does**:
1. Runs ESLint with auto-fix on staged `.js`, `.jsx`, `.ts`, `.tsx` files
2. Runs Prettier formatting on staged files (if Prettier is installed)
3. Runs Prettier check to verify formatting (for CI consistency)
4. Only processes files that are staged for commit

**Commands executed**:
```bash
npx lint-staged
```

**Graceful handling**:
- ✅ If Prettier is not installed: Skips formatting with a warning
- ❌ If ESLint script is missing: Fails with clear instructions

---

## Pre-push Hook

**Location**: `.husky/pre-push`

**Purpose**: Run comprehensive checks before code is pushed to remote

**What it does**:
1. Runs TypeScript type checking (`npm run typecheck`)
2. Runs unit tests (`npm run test`)
3. Skips E2E tests by default (run manually)

**Commands executed**:
```bash
npm run typecheck  # TypeScript type checking
npm run test       # Vitest unit tests
```

**Note**: E2E tests are NOT run automatically in pre-push to keep it fast. Run them manually:
```bash
npm run test:e2e
```

---

## Bypassing Hooks (Emergency Only)

In rare cases where you need to bypass hooks (e.g., work-in-progress commits), use:

```bash
# Bypass pre-commit hook
git commit --no-verify -m "WIP: work in progress"

# Bypass pre-push hook
git push --no-verify
```

⚠️ **Warning**: Only use `--no-verify` in emergencies. Your code must still pass all checks before merging.

---

## Configuration Files

### `.lintstagedrc.js`
Configures which commands run on which file types during pre-commit.

**Current configuration**:
- `*.{js,jsx,ts,tsx}`: ESLint + Prettier (write + check)
- `*.{json,md,yml,yaml,css,scss}`: Prettier only (write + check)

**Note**: The `prettier --check` command ensures formatting is verified, which is useful for CI pipelines to catch formatting issues.

### `.husky/pre-commit`
Shell script that runs `lint-staged`

### `.husky/pre-push`
Shell script that runs typecheck and tests

---

## Troubleshooting

### Hooks not running

**Problem**: Git hooks don't execute when committing/pushing

**Solution**:
```bash
# Reinstall hooks
npm run prepare

# Verify hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### ESLint errors

**Problem**: `ESLint script not found in package.json`

**Solution**: Add a lint script to `package.json`:
```json
{
  "scripts": {
    "lint": "next lint"
  }
}
```

### Prettier not installed

**Problem**: Warning about Prettier not being installed

**Solution**: This is not an error. Formatting is optional. To enable it:
```bash
npm install --save-dev prettier
```

### TypeScript errors in pre-push

**Problem**: `npm run typecheck` fails

**Solution**: Fix TypeScript errors before pushing:
```bash
npm run typecheck
```

### Tests failing in pre-push

**Problem**: `npm run test` fails

**Solution**: Fix failing tests before pushing:
```bash
npm run test
```

---

## Best Practices

1. **Commit often**: Pre-commit is fast, so commit frequently
2. **Fix issues immediately**: Don't bypass hooks unless absolutely necessary
3. **Run tests locally**: Before pushing, ensure all tests pass
4. **Keep commits small**: Smaller commits = faster hook execution

---

## Related Scripts

All scripts are defined in `package.json`:

```json
{
  "scripts": {
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

