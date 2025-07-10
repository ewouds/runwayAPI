# Testing Documentation

This document describes the testing setup and coverage for the runwayAPI project.

## Test Structure

```
__tests__/
├── setup.js                 # Global test configuration
├── __mocks__/
│   └── mockData.js          # Mock data for airport and METAR responses
├── main.test.js             # Tests for the main Express app
├── integration.test.js      # End-to-end integration tests
├── utils.test.js           # Tests for utility functions
├── api/
│   └── runway.test.js      # Tests for the runway API endpoint
└── helpers/
    └── downloadData.test.js # Tests for the data download helper
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

### PowerShell Commands

```powershell
# Run all tests
npm test

# Run specific test file
npx jest __tests__/api/runway.test.js

# Run tests matching a pattern
npx jest --testNamePattern="should return runway data"

# Run tests for specific file being tested
npx jest --testPathPattern=runway
```

## Test Coverage

The test suite covers:

- **Unit Tests**: Individual functions and modules
- **Integration Tests**: Full API request/response cycles
- **Error Handling**: Various error scenarios and edge cases
- **Data Validation**: Input validation and data transformation
- **External API Mocking**: Mocked responses from airport and METAR APIs

### Current Coverage Areas

1. **Main Express App** (`main.test.js`)
   - Route handling
   - Middleware functionality
   - Basic response structure

2. **Runway API** (`api/runway.test.js`)
   - Airport data retrieval and processing
   - METAR data parsing
   - Error handling for various failure scenarios
   - Data validation and transformation

3. **Download Helper** (`helpers/downloadData.test.js`)
   - HTTP request handling
   - Error handling for network failures
   - Response processing

4. **Integration Tests** (`integration.test.js`)
   - End-to-end request/response flows
   - Parameter handling
   - Error response formatting

5. **Utility Functions** (`utils.test.js`)
   - Data validation functions
   - URL creation
   - Data transformation
   - Wind direction processing

## Mock Data

The test suite uses comprehensive mock data located in `__tests__/__mocks__/mockData.js`:

- **Valid Airport Data**: Complete airport information with runways
- **Invalid Scenarios**: Airports with no runways or invalid runway data
- **METAR Data**: Valid and empty METAR responses

## Environment Variables

Test environment variables are defined in:
- `__tests__/setup.js` - Global test setup
- `.env.test` - Test-specific environment configuration

Required environment variables for testing:
- `NODE_ENV=test`
- `SERVER_PORT_RUNWAY=3001`
- `AIRPORTDB_API_TOKEN=test-token-12345`
- `API_VERSION=1.0.0-test`

## Testing Best Practices

1. **Mocking External Dependencies**: All external API calls are mocked to ensure tests run reliably
2. **Comprehensive Error Testing**: Tests cover various error scenarios including network failures, invalid data, and missing resources
3. **Data Validation**: Tests verify that data transformation and validation work correctly
4. **Integration Testing**: Full request/response cycles are tested to ensure the API works end-to-end

## Adding New Tests

When adding new functionality:

1. **Add unit tests** for new functions in the appropriate test file
2. **Update mock data** if new API responses are needed
3. **Add integration tests** for new endpoints or parameters
4. **Update this documentation** with any new test patterns or requirements

### Test Naming Convention

- Test files: `*.test.js`
- Test descriptions: Use descriptive names that explain what is being tested
- Group related tests using `describe()` blocks
- Use `it()` for individual test cases

### Example Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup for each test
  });

  describe('Specific functionality', () => {
    it('should do something specific', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Error case test
    });
  });
});
```
