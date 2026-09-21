const js = require('@eslint/js')
const cypressPlugin = require('eslint-plugin-cypress')
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ...cypressPlugin.configs.recommended,
    files: ['cypress/**/*.js'],
    languageOptions: {
      ...cypressPlugin.configs.recommended.languageOptions,
      sourceType: 'module',
      globals: {
        ...cypressPlugin.configs.recommended.languageOptions.globals,
        ...globals.node,
      },
    },
  },
  {
    ignores: ['node_modules/', 'cypress/reports/', 'cypress/videos/', 'cypress/screenshots/'],
  },
]
