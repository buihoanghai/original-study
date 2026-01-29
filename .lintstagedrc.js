/**
 * Lint-staged configuration
 * Runs linting and formatting on staged files only
 * 
 * This configuration gracefully handles missing tools:
 * - If prettier is not installed, formatting is skipped
 * - If eslint script doesn't exist, it fails with a clear message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Check if prettier is installed
function hasPrettier() {
  try {
    require.resolve('prettier');
    return true;
  } catch {
    return false;
  }
}

// Check if eslint script exists in package.json
function hasEslintScript() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    return packageJson.scripts && packageJson.scripts.lint;
  } catch {
    return false;
  }
}

module.exports = {
  // JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const commands = [];

    // ESLint is required - fail with clear message if not configured
    if (!hasEslintScript()) {
      console.error('\n❌ ESLint script not found in package.json');
      console.error('Add a "lint" script to package.json, for example:');
      console.error('  "lint": "next lint"\n');
      process.exit(1);
    }

    // Run ESLint on staged files
    commands.push(`eslint --fix ${filenames.join(' ')}`);

    // Run Prettier if available, otherwise skip gracefully
    if (hasPrettier()) {
      commands.push(`prettier --write ${filenames.join(' ')}`);
      // Add format:check for CI verification
      commands.push(`prettier --check ${filenames.join(' ')}`);
    } else {
      console.warn('⚠️  Prettier not installed, skipping formatting');
    }

    return commands;
  },

  // Other files - format only if prettier is available
  '*.{json,md,yml,yaml,css,scss}': (filenames) => {
    if (hasPrettier()) {
      return [
        `prettier --write ${filenames.join(' ')}`,
        `prettier --check ${filenames.join(' ')}`
      ];
    } else {
      console.warn('⚠️  Prettier not installed, skipping formatting');
      return [];
    }
  },
};

