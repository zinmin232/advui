// Shared flat ESLint config for every workspace package.
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export const ignores = {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/out/**',
    '**/.expo/**',
    '**/.turbo/**',
    '**/coverage/**',
    '**/android/**',
    '**/ios/**',
    '**/next-env.d.ts',
    '**/expo-env.d.ts',
  ],
}

/** Base config: JS + TypeScript + React hooks. */
export const base = tseslint.config(
  ignores,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.cjs', '**/*.config.js', '**/metro.config.js', '**/babel.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
)

/**
 * Library config: forbids raw colors in component source so every color flows
 * through theme tokens (see THEMING.md).
 */
export const library = tseslint.config(...base, {
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/**/*.test.{ts,tsx}', 'src/**/examples/**', 'src/**/*.meta.ts'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
        message: 'Do not hard-code colors in components. Use a theme token such as "$primary".',
      },
      {
        selector: 'Literal[value=/^(rgb|rgba|hsl|hsla)[(]/]',
        message: 'Do not hard-code colors in components. Use a theme token such as "$primary".',
      },
    ],
  },
})

/**
 * Keeps the component packages layered: core ← data ← charts, core ← editor.
 * `forbidden` lists the workspace packages this one may not import (anything
 * that depends on it, or would make a cycle). Other packages are imported by
 * name only, never by a path into their files.
 */
export function packageBoundaries(forbidden) {
  return {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...forbidden.map((name) => ({
              group: [name, `${name}/*`],
              message: `This package may not depend on ${name} (see ARCHITECTURE.md, Packages).`,
            })),
            {
              group: ['@advui/*/src', '@advui/*/src/*', '@advui/*/dist', '@advui/*/dist/*'],
              message: 'Import other packages through their public entry point.',
            },
            {
              regex: '^(\\.\\./)+(ui|data|charts|editor|catalog)/src/',
              message: 'Import other packages by name, not by a relative path.',
            },
          ],
        },
      ],
    },
  }
}

export default base
