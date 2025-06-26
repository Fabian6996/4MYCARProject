// client/jest.config.js
module.exports = {
    moduleDirectories: ['node_modules', 'src'],
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
  };
  