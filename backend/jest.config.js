/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.(spec|test)\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { strict: false, strictNullChecks: false, noImplicitAny: false } }] },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
}
