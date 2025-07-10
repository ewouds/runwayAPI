# Runway API Server

A Node.js Express API server that provides comprehensive airport runway information combined with real-time weather data (METAR) for aviation applications.

## 🛫 Overview

The Runway API fetches and combines airport runway data from AirportDB with current weather information (METAR) from aviation weather services. It's designed to provide pilots and aviation applications with essential runway and weather information for flight planning and operations.

## ✨ Features

- **Airport Runway Data**: Detailed runway information including dimensions, orientations, and ILS capabilities
- **Real-time Weather**: Current METAR data from multiple weather providers
- **Multiple Data Sources**: Support for AviationWeather.gov and VATSIM METAR providers
- **Data Validation**: Comprehensive validation of runway and weather data
- **Error Handling**: Robust error handling with meaningful error messages
- **CORS Support**: Configurable CORS for web applications
- **Comprehensive Testing**: 37 tests with 80% code coverage

## 🚀 Quick Start

### Prerequisites

- Node.js 14+
- npm or yarn
- AirportDB API token (sign up at [airportdb.io](https://airportdb.io))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd runwayAPI
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   SERVER_PORT_RUNWAY=3000
   AIRPORTDB_API_TOKEN=your_airportdb_api_token_here
   API_VERSION=1.0.0
   NODE_ENV=development
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on the port specified in your environment variables (default: 3000).

## 📡 API Endpoints

### GET `/`

Welcome endpoint that returns basic API information.

**Response:**

```json
{
  "code": 0,
  "message": "Welcome to Runway API. Use /api/v1/runway/:icao to get runway data for an airport.",
  "version": "1.0.0"
}
```

### GET `/api/v1/runway/:icao`

Get runway and weather data for a specific airport.

**Parameters:**

- `icao` (required) - ICAO airport code (e.g., KJFK, EGLL, LFPG)

**Query Parameters:**

- `metarProvider` (optional) - Weather data provider
  - `aviationweather` (default) - AviationWeather.gov
  - `vatsim` - VATSIM network

**Example Request:**

```bash
curl "http://localhost:3000/api/v1/runway/KJFK?metarProvider=aviationweather"
```

**Success Response:**

```json
{
  "name": "John F Kennedy International Airport",
  "home_link": "https://www.panynj.gov/airports/jfk.html",
  "metar": "KJFK 101851Z 28008KT 10SM FEW250 24/18 A3012 RMK AO2 SLP198",
  "runways": [
    {
      "width_ft": 200,
      "length_ft": 14511,
      "le_ident": "04L",
      "he_ident": "22R",
      "he_latitude_deg": 40.651798,
      "he_longitude_deg": -73.776102,
      "he_heading_degT": 223.1,
      "le_ils": null,
      "he_ils": "ILS",
      "surface": "ASPH"
    }
  ],
  "elevation": 4,
  "wind_direction": 280,
  "wind_speed": 8,
  "icao": "KJFK",
  "station": {
    "icao_code": "KJFK",
    "distance": 0
  },
  "time": "2024-07-10T18:51:00Z",
  "metarData": {
    "wind": {
      "degrees": 280,
      "speed_kts": 8
    },
    "observed": "2024-07-10T18:51:00Z"
  }
}
```

**Error Responses:**

Airport not found:

```json
{
  "code": 2,
  "error": "Can't find airport XXXX data. Try to search a nearest bigger airport"
}
```

No runway data:

```json
{
  "code": 3,
  "error": "Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport"
}
```

Invalid runway data:

```json
{
  "code": 4,
  "error": "Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport"
}
```

## 🏗️ Project Structure

```
runwayAPI/
├── main.cjs                 # Express server entry point
├── package.json             # Dependencies and scripts
├── jest.config.js          # Jest test configuration
├── .env                    # Environment variables (create this)
├── .env.test              # Test environment variables
├── api/
│   └── runway.cjs         # Main runway API endpoint
├── helpers/
│   └── downloadData.cjs   # HTTP request utility
└── __tests__/             # Test suite
    ├── setup.js           # Test configuration
    ├── __mocks__/         # Mock data
    ├── api/               # API endpoint tests
    ├── helpers/           # Helper function tests
    └── *.test.js         # Various test files
```

## 🧪 Testing

The project includes a comprehensive test suite with 37 tests covering:

- Unit tests for individual functions
- Integration tests for API endpoints
- Error handling scenarios
- Data validation and transformation

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests for CI/CD
npm run test:ci
```

### Test Coverage

- **Overall Coverage**: 80% statements, 89.74% branches, 76.92% functions
- **API Logic**: 100% coverage for core runway API functionality

## 🔧 Configuration

### Environment Variables

| Variable              | Description         | Default       | Required |
| --------------------- | ------------------- | ------------- | -------- |
| `SERVER_PORT_RUNWAY`  | Server port         | 3000          | Yes      |
| `AIRPORTDB_API_TOKEN` | AirportDB API token | -             | Yes      |
| `API_VERSION`         | API version string  | "dev"         | No       |
| `NODE_ENV`            | Environment mode    | "development" | No       |

### CORS Configuration

CORS is automatically enabled in development mode. For production, configure CORS settings in `main.cjs` as needed for your specific use case.

## 📊 Data Sources

- **Airport Data**: [AirportDB.io](https://airportdb.io) - Comprehensive airport and runway information
- **Weather Data**:
  - [AviationWeather.gov](https://aviationweather.gov) - Official US aviation weather
  - [VATSIM](https://metar.vatsim.net) - Flight simulation network weather data

## 🔒 Security Considerations

- API tokens are loaded from environment variables
- Input validation for ICAO codes
- Error messages don't expose sensitive internal information
- Request logging for monitoring and debugging

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker (if needed)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance

- Efficient data fetching with minimal external API calls
- Built-in request logging for monitoring
- Lightweight Express.js framework
- Optimized data validation and transformation

## 🐛 Troubleshooting

### Common Issues

1. **"Can't find airport data"** - Verify the ICAO code is correct and the airport exists in AirportDB
2. **"Invalid runway data"** - Some airports may have incomplete runway information
3. **Weather data unavailable** - Try switching METAR providers using the `metarProvider` parameter
4. **API token errors** - Ensure your `AIRPORTDB_API_TOKEN` is valid and properly set

### Debugging

Enable detailed logging by setting `NODE_ENV=development` and check console output for detailed request/response information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## 📄 License

ISC License - see package.json for details

## 🆘 Support

For API issues or questions:

- Check the test suite for usage examples
- Review error responses for specific error codes
- Ensure all environment variables are properly configured

---

**Made for aviation enthusiasts and developers** ✈️
