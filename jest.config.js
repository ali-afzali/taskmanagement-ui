/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  testEnvironment: 'jsdom',

  // Use ts-jest to compile TypeScript test files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },

  // Run src/setupTests.ts before each test suite (loads @testing-library/jest-dom matchers)
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Map CSS/asset imports so they don't break in the Node.js test environment
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|ico|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },

  // Discover test files under src/
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],

  // Files included when generating coverage reports
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/react-app-env.d.ts',
    '!src/setupTests.ts',
  ],

  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
};

module.exports = config;
