module.exports = {
  clearMocks: true,
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
  },
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
}
