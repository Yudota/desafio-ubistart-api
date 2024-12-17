module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    maxWorkers: 2, 
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    globals: {
      'ts-jest': {
        diagnostics: false,
      },
    },
  };
  