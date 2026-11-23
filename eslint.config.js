import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results', '.lighthouseci']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { '@stylistic': stylistic },
    rules: {
      // Numbers in template strings are safe and common in SVG path building.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration:has(JSXElement), FunctionDeclaration:has(JSXFragment)',
          message: 'Components use arrow functions: export const X = () => …',
        },
        {
          selector:
            ':matches(Program, ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression:not(:has(JSXElement)):not(:has(JSXFragment))',
          message: 'Plain logic, utils and hooks use `function name() {}`.',
        },
      ],
    },
  },
  {
    // shadcn components export variants next to the component.
    files: ['src/components/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: { 'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }] },
  },
  prettier,
  {
    // eslint-config-prettier turns curly off; "all" is Prettier-compatible, so re-enable it last.
    files: ['**/*.{ts,tsx}'],
    rules: { curly: ['error', 'all'] },
  },
]);
