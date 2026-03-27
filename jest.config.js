/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|uuid)',
  ],
  moduleNameMapper: {
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/@expo/vector-icons.js',
    '^@expo/vector-icons/(.*)$': '<rootDir>/__mocks__/@expo/vector-icons.js',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.worktrees/'],
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '<rootDir>/.worktrees/',
  ],
  coverageThreshold: {
    global: {
      statements: 65,
      branches: 55,
      functions: 58,
      lines: 68,
    },
  },
};
