// Global test setup
process.env.NODE_ENV = "test";
process.env.SERVER_PORT_RUNWAY = "3001";
process.env.AIRPORTDB_API_TOKEN = "test-token";
process.env.API_VERSION = "1.0.0";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};
