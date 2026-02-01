// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = (async () => {
  const stylistic = await import('@stylistic/eslint-plugin');

  return defineConfig([
    expoConfig,
    prettier,
    {
      plugins: { '@stylistic': stylistic.default },
      rules: {
        // Force object properties on separate lines when multiline
        '@stylistic/object-curly-newline': [
          'error',
          {
            ObjectExpression: {
              multiline: true,
              minProperties: 2,
            },
            ObjectPattern: {
              multiline: true,
              minProperties: 3,
            },
            ImportDeclaration: {
              multiline: true,
              minProperties: 4,
            },
            ExportDeclaration: {
              multiline: true,
              minProperties: 2,
            },
          },
        ],
        '@stylistic/object-property-newline': [
          'error',
          { allowAllPropertiesOnSameLine: false },
        ],
      },
    },
    { ignores: ['dist/*'] },
  ]);
})();
