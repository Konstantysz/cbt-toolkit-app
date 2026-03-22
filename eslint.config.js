const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/', '.expo/', 'android/', 'ios/', 'components/'],
  },
  {
    // Jest mocks must be declared before imports — import/first is intentionally violated
    files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
    rules: {
      'import/first': 'off',
    },
  },
];
