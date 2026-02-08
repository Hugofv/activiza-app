// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  // 1. Base Expo / React Native rules
  expoConfig,

  // 2. Prettier — disables formatting rules (Prettier handles all formatting)
  prettier,

  // 3. Airbnb-inspired quality rules + React Native / TypeScript overrides
  {
    rules: {
      // -- Airbnb-inspired quality rules (logic, not formatting) --
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'no-else-return': 'warn',
      'prefer-arrow-callback': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'no-unneeded-ternary': 'warn',
      'dot-notation': 'warn',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-useless-catch': 'error',
      'no-lonely-if': 'warn',
      'no-multi-assign': 'error',
      'no-param-reassign': ['warn', { props: false }],
      'no-console': 'warn',
      'no-await-in-loop': 'warn',
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

      // -- React Native overrides --
      'no-use-before-define': 'off',
      'global-require': 'off',
      'no-nested-ternary': 'off',
      'no-underscore-dangle': 'off',

      // -- TypeScript compatibility --
      'no-unused-vars': 'off',
      'no-shadow': 'off',
      'no-unused-expressions': 'off',
      'consistent-return': 'off',
      camelcase: 'off',
      'class-methods-use-this': 'off',

      // -- Import rules (TypeScript handles these) --
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // Ignores
  { ignores: ['dist/*'] },
]);
